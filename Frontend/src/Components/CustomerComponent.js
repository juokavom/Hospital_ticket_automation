import React, { useState, useEffect, useReducer } from 'react';
import { useCookies } from 'react-cookie';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import {
    baseUrl, wsEP, cancelStompEP, startStompEP, endStompEP, singleVisitEP, multipleVisitsEP, cancelActionEP
} from '../shared/APIEndpoints';
import Timer from './CounterComponent';
import VisitsList from './VisitsListComponent';
import { useAlert } from 'react-alert';
import {
    Button, Card, CardTitle, CardText, Container, Row, Col, Collapse, Modal, ModalBody, Label
} from 'reactstrap';
import { GETRequest } from '../shared/APICalls';


const reducer = (state, action) => {
    switch (action.type) {
        case "updateVisit":
            return { ...state, visit: action.payload }
        case "updateVisits":
            return { ...state, visits: action.payload }
        case "updateTime":
            return { ...state, time: action.payload }
        case "updateStomp":
            return { ...state, stomp: action.payload }
        default: return;
    }
}

function Customer(props) {
    const [cookies, , removeCookie] = useCookies(['customer']);
    const [cancelledVisit, setCancelledVisit] = useState({ id: null, affectedVisits: null });
    const alert = useAlert(null)
    const [state, dispatch] = useReducer(reducer, { visit: null, visits: null, time: { hours: 0, minutes: 0, seconds: 0 }, stomp: null });
    const [isModalOpen, setModalOpen] = useState(false);
    const [startedVisit, setStartedVisit] = useState({ affectedVisit: null });
    const [endedVisit, setEndedVisit] = useState({ affectedVisit: null });

    useEffect(() => {
        const time = state.visit != null ? state.visit.time.split(":") : ["00", "00"];
        dispatch({ type: "updateTime", payload: { hours: parseInt(time[0]), minutes: parseInt(time[1]), seconds: 0 } });
    }, [state.visit])

    useEffect(() => {
        if (cancelledVisit != null && cancelledVisit.id != null) {
            if (cancelledVisit.id === state.visit.id) {
                state.visit.status = "CANCELLED"
                dispatch({ type: "updateVisit", payload: state.visit });
                dispatch({ type: "updateStomp", payload: state.stomp.disconnect() });
                alert.show('Your visit was cancelled!', {
                    timeout: 3000,
                    type: 'error'
                })
            } else if (cancelledVisit.id < state.visit.id) {
                for (var i = 0; i < cancelledVisit.affectedVisits.length; i++) {
                    if (state.visit.id === cancelledVisit.affectedVisits[i].id) {
                        state.visit.time = cancelledVisit.affectedVisits[i].time
                    }
                }
                const time = state.visit.time.split(":");
                dispatch({ type: "updateTime", payload: { hours: parseInt(time[0]), minutes: parseInt(time[1]), seconds: 0 } });
                dispatch({ type: "updateVisit", payload: state.visit });
                alert.show('Other customer in front you cancelled the visit! Your time has been adjusted.', {
                    timeout: 4000,
                    type: 'info'
                })
            }
            for (i = 0; i < state.visits.length; i++) {
                for (var u = 0; u < cancelledVisit.affectedVisits.length; u++) {
                    if (state.visits[i].id === cancelledVisit.affectedVisits[u].id) {
                        state.visits[i].time = cancelledVisit.affectedVisits[u].time
                        dispatch({ type: "updateVisits", payload: state.visits });
                    }
                }
                if (state.visits[i].id === cancelledVisit.id) {
                    state.visits.splice(i, 1)
                    dispatch({ type: "updateVisits", payload: state.visits });
                }

            }
        }
    }, [cancelledVisit])

    useEffect(() => {
        if (startedVisit.affectedVisit != null) {
            let startedSomeone = false;
            if (state.visits != null && state.visits.length > 0) {
                state.visits.map(i => {
                    if (i.id === startedVisit.affectedVisit) {
                        startedSomeone = true
                        i.status = "STARTED"
                    }
                });
                dispatch({ type: "updateVisits", payload: state.visits });
            }

            if (state.visit != null && state.visit.id === startedVisit.affectedVisit) {
                state.visit.status = "STARTED"
                alert.show('Your visit was started!', {
                    timeout: 3000,
                    type: 'success'
                })
                dispatch({ type: "updateVisit", payload: state.visit });
            } else if (startedSomeone) {
                alert.show('Visit has started for one of the customers in front you!', {
                    timeout: 3000,
                    type: 'success'
                })
            }
        }
    }, [startedVisit.affectedVisit])

    useEffect(() => {
        if (endedVisit.affectedVisit != null) {
            let endedSomeone = false;
            if (state.visits != null && state.visits.length > 0) {
                endedSomeone = true;
                if (state.visits.length === 1) dispatch({ type: "updateVisits", payload: null });
                else {
                    var list = state.visits.filter(i => i.id !== endedVisit.affectedVisit);
                    dispatch({ type: "updateVisits", payload: list });
                }
            }

            if (state.visit != null && state.visit.id === endedVisit.affectedVisit) {
                state.visit.status = "ENDED"
                alert.show('Your visit was ended!', {
                    timeout: 3000,
                    type: 'error'
                })
                dispatch({ type: "updateVisit", payload: state.visit });
            } else if (endedSomeone) {
                alert.show('Visit has ended for one of the customers in front you!', {
                    timeout: 3000,
                    type: 'info'
                })
            }
        }
    }, [endedVisit.affectedVisit])

    const getSpecialistId = JSON.parse(localStorage.getItem('specialist')).id;

    const registerSTOMP = () => {
        var sock = new SockJS(baseUrl + wsEP);
        let stompClient = Stomp.over(sock);

        stompClient.connect({ 'Authorization': cookies.customer }, () => {
            stompClient.subscribe(cancelStompEP + getSpecialistId, (message) => {
                let body = JSON.parse(message.body)
                setCancelledVisit({ id: parseInt(body.visit), affectedVisits: body.affectedVisits });
            });
            stompClient.subscribe(startStompEP + getSpecialistId, (message) => {
                let body = JSON.parse(message.body)
                setStartedVisit({ affectedVisit: parseInt(body.id) });
            });
            stompClient.subscribe(endStompEP + getSpecialistId, (message) => {
                let body = JSON.parse(message.body)
                setEndedVisit({ affectedVisit: parseInt(body.id) });
            });
        })
        stompClient.debug = null;
        dispatch({ type: "updateStomp", payload: stompClient });
    }

    const fetchVisit = async () => {
        dispatch({
            type: "updateVisit",
            payload: await GETRequest(singleVisitEP, cookies.customer)
                .then(response => {
                    if (response.status === 200) {
                        return response;
                    }
                }).then(response => response.json())
        });
    }

    const fetchVisits = async () => {
        dispatch({
            type: "updateVisits",
            payload: await GETRequest(multipleVisitsEP, cookies.customer)
                .then(response => {
                    if (response.status === 200) {
                        return response;
                    }
                })
                .then(response => response.json())
        });
        return
    }

    useEffect(() => {
        return (fetchVisit(), fetchVisits(), registerSTOMP())
    }, [])

    if (state.visit != null) {
        switch (state.visit.status) {
            case "ENDED":
            case "STARTED":
            case "CANCELLED":
                return (
                    <div>
                        <Container>
                            <Row className="mt-5">
                                <Col xs={{ size: 10, offset: 1 }} md={{ size: 6, offset: 3 }}>
                                    <Card body className="text-center">
                                        <CardTitle tag="h3">Your visit for <em>{state.visit.specialist.title} was {state.visit.status}</em></CardTitle>
                                        <Row className="m-2">
                                            <Col>
                                                <CardText tag="h5">Your visit code: <strong>{state.visit.code}</strong></CardText>
                                            </Col>
                                        </Row>
                                        <Collapse isOpen={state.visit.status === "CANCELLED"}>
                                            <Row className="m-2">
                                                <Col>
                                                    <CardText>Planned time of the visit
                                            : <strong>{state.time.hours}:{state.time.minutes < 10 ? "0" : ""}{state.time.minutes}</strong></CardText>
                                                </Col>
                                            </Row>
                                        </Collapse>
                                        <Row className="m-2">
                                            <Col>
                                                <Collapse isOpen={state.visit.status !== "STARTED"}>
                                                    <Button color="secondary" onClick={() => {
                                                        removeCookie("customer");
                                                        props.setWindow("Main")
                                                    }}>Go to main page</Button>
                                                </Collapse>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                );
            default:
                if (state.visits != null) {
                    return (
                        <div>
                            <Container>
                                <Modal isOpen={isModalOpen} toggle={() => setModalOpen(!isModalOpen)}>
                                    <ModalBody className="text-center">
                                        <Label tag="h5">Are you sure you want to cancel this visit? This action cannot be undone.</Label>
                                        <Row body className="text-center mt-4">
                                            <Col>
                                                <Button outline color="primary" onClick={() => setModalOpen(false)}>No, go back!</Button>
                                            </Col>
                                            <Col>
                                                <Button color="danger" onClick={() => {
                                                    state.stomp.send(cancelActionEP + getSpecialistId, {}, state.visit.id);
                                                }}>Yes, cancel!</Button>
                                            </Col>
                                        </Row>
                                    </ModalBody>
                                </Modal>
                                <Row className="mt-5">
                                    <Col xs={{ size: 10, offset: 1 }} md={{ size: 6, offset: 3 }}>
                                        <Card body className="text-center">
                                            <CardTitle tag="h3"><em>{state.visit.specialist.title}</em> visit queue</CardTitle>
                                            <Row className="m-2">
                                                <Col>
                                                    <CardText tag="h5">Your visit code: <strong>{state.visit.code}</strong></CardText>
                                                </Col>
                                            </Row>
                                            <Row className="m-2">
                                                <Col>
                                                    <CardText>Time of the visit
                                            : <strong>{state.time.hours}:{state.time.minutes < 10 ? "0" : ""}{state.time.minutes}</strong></CardText>
                                                </Col>
                                            </Row>
                                            <Row className="m-2">
                                                <Col>
                                                    <CardText><strong>{state.visits.length - 1}</strong> people are in line before you</CardText>
                                                </Col>
                                            </Row>
                                            <Row className="m-2">
                                                <Col>
                                                    <Timer time={state.time} />
                                                </Col>
                                            </Row>
                                            <Row className="m-2">
                                                <Col>
                                                    <Button outline color="danger" onClick={() => setModalOpen(true)}>Cancel visit</Button>
                                                </Col>
                                            </Row>
                                        </Card>
                                    </Col>
                                </Row>
                                <Row style={{ paddingBottom: '200px' }}>
                                    <Col>
                                        <VisitsList visits={state.visits} visit={state.visit} />
                                    </Col>
                                </Row>
                            </Container>
                        </div >
                    );
                }
        }
    }
    return (<div></div>);
}
export default Customer;