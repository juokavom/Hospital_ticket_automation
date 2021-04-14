import React, { useState, useEffect, useReducer } from 'react';
import { useCookies } from 'react-cookie';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import {
    baseUrl, cancelActionEP, cancelStompEP, startStompEP, endStompEP, addStompEP,
    endActionEP, startActionEP, specialistVisitsEP, wsEP
} from '../shared/APIEndpoints';
import { useAlert } from 'react-alert';
import {
    Button, Card, CardTitle, CardText, Container, Row, Col, Collapse, Table
} from 'reactstrap';
import { GETRequest } from '../shared/APICalls';


const reducer = (state, action) => {
    switch (action.type) {
        case "setVisits":
            if (action.payload.length > 1) {
                const firstElement = action.payload.shift();
                return { ...state, visits: action.payload, first: firstElement, inited: true }
            } else if (action.payload.length === 1) {
                return { ...state, first: action.payload[0], inited: true }
            } else {
                return { ...state, inited: true }
            }
        case "startVisit":
            if (state.first != null && state.first.id === action.payload) {
                state.first.status = "STARTED"
                return { ...state, first: state.first }
            }
            break;
        case "endVisit":
            if (state.first != null && state.first.id === action.payload) {
                state.first.status = "ENDED"
                return { ...state, first: state.first }
            }
            break;
        case "addVisit":
            if (state.first == null) {
                return { ...state, first: action.payload }
            } else if (state.visits == null) {
                return { ...state, visits: [action.payload] }
            } else {
                var list = state.visits
                list.push(action.payload)
                return { ...state, visits: list }
            }
        case "cancelVisit":
            if (state.first != null && state.first.id === action.payload) {
                if (state.visits != null && state.visits.length > 0) {
                    const firstElement = state.visits.shift();
                    return { ...state, visits: state.visits, first: firstElement }
                }
                return { ...state, first: null }
            } else {
                if (state.visits != null && state.visits.length > 0) {
                    var list = state.visits.filter(i => i.id !== action.payload);
                    return { ...state, visits: list }
                }
                break;
            }
        case "updateVisitsAndFirst":
            return { ...state, visits: action.visits, first: action.first }
        case "updateStomp":
            return { ...state, stomp: action.payload }
        default: return;
    }
}

function VisitTable(props) {
    if (props.visits != null) {
        if (props.visits.length > 0) {
            const generateVisitTable = props.visits.map(vis => {
                return (
                    <tr key={vis.id}>
                        <th scope="row">{vis.code}</th>
                        <td>{vis.time}</td>
                        <td>{vis.status}</td>
                        <td><Button outline onClick={() => props.stomp.send(cancelActionEP + props.specialist.id, {}, vis.id)}>Cancel</Button></td>
                    </tr>
                );
            });

            return (
                <Row className="mt-5" style={{ paddingBottom: '200px' }}>
                    <Col xs={{ size: 10, offset: 1 }} md={{ size: 6, offset: 3 }}>
                        <Card body className="text-center">
                            <CardTitle tag="h3">Rest visits</CardTitle>
                            <Table hover>
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {generateVisitTable}
                                </tbody>
                            </Table>
                        </Card>
                    </Col>
                </Row>);
        }
    }
    return (<div></div>);
}

function Specialist(props) {
    const [cookies, , removeCookie] = useCookies(['specialist']);
    const [cancelledVisit, setCancelledVisit] = useState({ id: null, affectedVisits: null });
    const [addedVisit, setAddedVisit] = useState({ affectedVisit: null });
    const alert = useAlert(null)
    const [state, dispatch] = useReducer(reducer, { visits: null, first: null, stomp: null, inited: false });


    useEffect(() => {
        if (cancelledVisit.affectedVisits != null && state.visits != null) {
            for (var i = 0; i < state.visits.length; i++) {
                for (var u = 0; u < cancelledVisit.affectedVisits.length; u++) {
                    if (state.visits[i].id === cancelledVisit.affectedVisits[u].id) {
                        state.visits[i].time = cancelledVisit.affectedVisits[u].time
                        dispatch({ type: "updateVisitsAndFirst", visits: state.visits, first: state.first });
                    }
                }
            }
        }
        if (cancelledVisit.id != null) {
            alert.show('One of your visits were cancelled! Times for other customers have been recalculated.', {
                timeout: 3000,
                type: 'info'
            })
            dispatch({ type: "cancelVisit", payload: cancelledVisit.id });
        }

    }, [cancelledVisit])

    useEffect(() => {
        if (addedVisit.affectedVisit != null) {
            dispatch({ type: "addVisit", payload: addedVisit.affectedVisit });
            alert.show('You have new visit!', {
                timeout: 3000,
                type: 'info'
            })
        }
    }, [addedVisit])

    const getSpecialist = JSON.parse(localStorage.getItem('specialist'));

    const registerSTOMP = () => {
        var sock = new SockJS(baseUrl + wsEP);
        let stompClient = Stomp.over(sock);

        stompClient.connect({ 'Authorization': cookies.specialist }, () => {
            stompClient.subscribe(cancelStompEP + getSpecialist.id, (message) => {
                let body = JSON.parse(message.body)
                setCancelledVisit({ id: parseInt(body.visit), affectedVisits: body.affectedVisits });
            });
            stompClient.subscribe(startStompEP + getSpecialist.id, (message) => {
                let body = JSON.parse(message.body)
                dispatch({ type: "startVisit", payload: parseInt(body.id) });
            });
            stompClient.subscribe(endStompEP + getSpecialist.id, (message) => {
                let body = JSON.parse(message.body)
                dispatch({ type: "endVisit", payload: parseInt(body.id) });
                dispatch({ type: "cancelVisit", payload: parseInt(body.id) });
            });
            stompClient.subscribe(addStompEP + getSpecialist.id, (message) => {
                let body = JSON.parse(message.body)
                setAddedVisit({ affectedVisit: body });
            });
        })
        stompClient.debug = null;
        dispatch({ type: "updateStomp", payload: stompClient });
    }


    const fetchVisits = async () => {
        dispatch({
            type: "setVisits",
            payload: await GETRequest(specialistVisitsEP, cookies.specialist)
                .then(response => {
                    if (response.status === 200) {
                        return response;
                    }
                })
                .then(response => response.json())
        });
    }

    useEffect(() => {
        return (registerSTOMP(), fetchVisits())
    }, [])


    if (state.first != null) {
        const getCustomerCount = (state.visits == null ? 0 : state.visits.length) + 1
        return (
            <div>
                <Container>
                    <Row className="mt-5">
                        <Col xs={{ size: 10, offset: 1 }} md={{ size: 6, offset: 3 }}>
                            <Card body className="text-center">
                                <CardTitle tag="h3">Logged in as <em>{getSpecialist.title}</em></CardTitle>
                                <Row className="m-2">
                                    <Col>
                                        <CardText>Total customers: <strong>{getCustomerCount}</strong></CardText>
                                    </Col>
                                </Row>
                                <Row className="m-2">
                                    <Col>
                                        <CardText>Time per visit: <strong>{getSpecialist.timeForVisit}min</strong></CardText>
                                    </Col>
                                </Row>

                                <Row className="mt-4">
                                    <Col>
                                        <CardText tag="h5">{state.first.status === "DUE" ? "Upcoming" : "Current"} visit: <strong></strong></CardText>
                                    </Col>
                                </Row>
                                <Row className="mt-3 mr-3 ml-3">
                                    <Col>
                                        <Table bordered>
                                            <thead>
                                                <tr>
                                                    <th>Code</th>
                                                    <th>Time</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <th>{state.first.code}</th>
                                                    <td>{state.first.time}</td>
                                                    <td>{state.first.status}</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Row>
                                <Row className="mr-5 ml-5">
                                    <Col>
                                        <Collapse isOpen={state.first.status === "DUE"}>
                                            <Button color="success" onClick={() =>
                                                state.stomp.send(startActionEP + getSpecialist.id, {}, state.first.id)}>Start</Button>
                                        </Collapse>
                                    </Col>
                                    <Col>
                                        <Collapse isOpen={state.first.status === "STARTED"}>
                                            <Button color="danger" onClick={() =>
                                                state.stomp.send(endActionEP + getSpecialist.id, {}, state.first.id)}>End</Button>
                                        </Collapse>
                                    </Col>
                                    <Col>
                                        <Collapse isOpen={state.first.status === "DUE"}>
                                            <Button outline color="secondary" onClick={() =>
                                                state.stomp.send(cancelActionEP + getSpecialist.id, {}, state.first.id)}>Cancel</Button>
                                        </Collapse>
                                    </Col>
                                </Row>
                                <Row className="m-2">
                                    <Col className="text-left">
                                        <Button color="link" onClick={() => {
                                            dispatch({ type: "updateStomp", payload: state.stomp.disconnect() });
                                            removeCookie("specialist");
                                            props.setWindow("Main");
                                        }}>Logout</Button>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                    <VisitTable visits={state.visits} specialist={getSpecialist} stomp={state.stomp} />
                </Container>
            </div >
        );
    }
    else if (state.inited) {
        return (
            <div>
                <Row className="mt-5">
                    <Col xs={{ size: 10, offset: 1 }} md={{ size: 6, offset: 3 }}>
                        <Card body className="text-center">
                            <CardTitle tag="h3">Logged in as <em>{getSpecialist.title}</em></CardTitle>
                            <Row className="m-2">
                                <Col>
                                    <CardText>Time per visit: <strong>{getSpecialist.timeForVisit}min</strong></CardText>
                                </Col>
                            </Row>
                            <Row className="m-2">
                                <Col>
                                    <CardText tag="h5">There are no upcoming visits</CardText>
                                </Col>
                            </Row>
                            <Row className="m-2">
                                <Col className="text-left">
                                    <Button color="link" onClick={() => {
                                        dispatch({ type: "updateStomp", payload: state.stomp.disconnect() });
                                        removeCookie("specialist");
                                        props.setWindow("Main");
                                    }}>Logout</Button>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </div>);
    }
    else return (<div></div>)
}
export default Specialist;