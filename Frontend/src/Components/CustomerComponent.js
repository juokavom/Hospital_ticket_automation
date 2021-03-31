import React, { useState, useEffect, useReducer } from 'react';
import { useCookies } from 'react-cookie';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs'; //requires dependency
import { baseUrl } from '../shared/baseUrl';
import Timer from './CounterComponent';
import VisitsList from './VisitsListComponent';
import { useAlert } from 'react-alert';
import {
    Button, Card, CardTitle, CardText, Container, Row, Col, Collapse
} from 'reactstrap';
import { customerGETRequest } from '../shared/APICalls';


const reducer = (state, action) => {
    switch (action.type) {
        case "updateVisit":
            return { ...state, visit: action.payload }
        case "updateVisits":
            return { ...state, visits: action.payload }
        default: return;
    }
}

function Customer() {
    const [cookies] = useCookies(['customer']);
    const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [stomp, setStomp] = useState(null);
    const [cancelledVisit, setCancelledVisit] = useState(null);
    const alert = useAlert(null)
    const [state, dispatch] = useReducer(reducer, { visit: null, visits: null });

    useEffect(() => {
        const time = state.visit != null ? state.visit.time.split(":") : ["00", "00"];
        setTime({ hours: parseInt(time[0]), minutes: parseInt(time[1]), seconds: 0 })
    }, [state.visit])

    useEffect(() => {
    }, [state.visits])


    useEffect(() => {
        let myCancellation = false;
        if (cancelledVisit != null) {
            if (cancelledVisit === state.visit.id) {
                myCancellation = true;
                state.visit.status = "CANCELLED"
                dispatch({ type: "updateVisit", payload: state.visit });
                alert.show('Your visit was cancelled!', {
                    timeout: 3000,
                    type: 'error'
                })
            }
            for (var i = 0; i < state.visits.length; i++) {
                if (state.visits[i].id === cancelledVisit) {
                    state.visits.splice(i, 1)
                    dispatch({ type: "updateVisits", payload: state.visits });
                    if(!myCancellation) alert.show('Other customer in front you cancelled the visit! Your time has been adjusted.', {
                        timeout: 4000,
                        type: 'info'
                    })
                }
            }
        }
    }, [cancelledVisit])

    const registerSTOMP = () => {
        var sock = new SockJS(baseUrl + '/ticket');
        let stompClient = Stomp.over(sock);

        stompClient.connect({ 'Authorization': cookies.customer }, () => {
            stompClient.subscribe("/queue/cancel", (message) => {
                setCancelledVisit(parseInt(message.body));
            });
        })
        stompClient.debug = null;
        setStomp(stompClient);
    }

    const fetchVisit = async () => {
        dispatch({
            type: "updateVisit",
            payload: await customerGETRequest("/visit", cookies.customer)
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
            payload: await customerGETRequest("/visit/all", cookies.customer)
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


    const cncl = () => state.visit != null ? state.visit.status === "DUE" ? true : false : false

    return (
        <div>
            <Container>
                <Row className="mt-5">
                    <Col xs={{ size: 10, offset: 1 }} md={{ size: 6, offset: 3 }}>
                        <Card body className="text-center">
                            <CardTitle tag="h3"><em>{state.visit != null ? state.visit.specialist.title : ""}</em> visit queue</CardTitle>
                            <Row className="m-2">
                                <Col>
                                    <CardText tag="h5">Your visit code: <strong>{state.visit != null ? state.visit.code : ""}</strong></CardText>
                                </Col>
                            </Row>
                            <Row className="m-2">
                                <Col>
                                    <CardText>Time for your visit
                                : <strong>{time.hours}:{time.minutes < 10 ? "0" : ""}{time.minutes}</strong></CardText>
                                </Col>
                            </Row>
                            <Row className="m-2">
                                <Col>
                                    <Timer time={time} />
                                </Col>
                            </Row>
                            <Row className="m-2">
                                <Col>
                                    <Collapse isOpen={cncl()}>
                                        <Button outline color="danger" onClick={() => stomp.send("/app/cancel", {}, {})}>Cancel visit</Button>
                                    </Collapse>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
                <VisitsList visits={state.visits} visit={state.visit} />
            </Container>
        </div>
    );
}
export default Customer;