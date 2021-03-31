import React, { useState, useEffect, useReducer } from 'react';
import { useCookies } from 'react-cookie';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs'; //requires dependency
import { baseUrl } from '../shared/baseUrl';
import Timer from './CounterComponent';
import VisitsList from './VisitsListComponent';
import { useAlert, withAlert } from 'react-alert';
import {
    Button, Card, CardTitle, CardText, Container, Row, Col, Collapse
} from 'reactstrap';
import { customerGETRequest } from '../shared/APICalls';

// stompClient.debug = null;

function Customer(props) {
    const [cookies] = useCookies(['customer']);
    const [visit, setVisit] = useState(null);
    const [visits, setVisits] = useState(null);
    const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [canCancel, setCanCancel] = useState(true);
    const [stomp, setStomp] = useState(null);
    const [cancelledVisit, setCancelledVisit] = useState(null);
    const alert = useAlert(null)
    const [state, dispatch] = useReducer(reducer, { visits: null });

    useEffect(() => {
        const time = visit != null ? visit.time.split(":") : ["00", "00"];
        setTime({ hours: parseInt(time[0]), minutes: parseInt(time[1]), seconds: 0 })
        setCanCancel(visit != null ? visit.status === "DUE" ? true : false : false)
    }, [visit])

    useEffect(() => {
        console.log('visits updated = ', state.visits)
    }, [state])


    function reducer(state, action) {
        switch (action.type) {
            case "set":
                return { visits: action.payload }
            case "add":
                return { ...state, visits: action.payload }
        }
    }

    useEffect(() => {
        if (cancelledVisit != null) {
            if (cancelledVisit === visit.id) {
                visit.status = "CANCELLED"
                setVisit(state => visit)
                // setCanCancel(false)
                alert.show('Your visit was cancelled!', {
                    timeout: 3000,
                    type: 'error'
                })
            }
            console.log('Will remove from list if found')
            for (var i = 0; i < state.visits.length; i++) {
                if (state.visits[i].id === cancelledVisit) {
                    console.log('found, removimg ...', state.visits[i])
                    let stateTemp = state.visits
                    stateTemp.splice(i, 1)
                    dispatch({ type: "add", payload: stateTemp });
                }
            }
            console.log('list after removing = ', state.visits)
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
        setStomp(stompClient);
    }

    const fetchVisit = () => {
        return customerGETRequest("/visit", cookies.customer)
            .then(response => {
                if (response.status === 200) {
                    return response;
                }
            })
            .then(response => response.json())
            .then(response => {
                setVisit(response)
            })
    }

    const fetchVisits = () => {
        return customerGETRequest("/visit/all", cookies.customer)
            .then(response => {
                if (response.status === 200) {
                    return response;
                }
            })
            .then(response => response.json())
            .then(response => {
                // setVisits(response)                
                dispatch({ type: "set", payload: response });
            })
    }

    useEffect(() => {
        return (fetchVisit(), fetchVisits(), registerSTOMP())
    }, [])


    return (
        <div>
            <Container>
                <Row className="mt-5">
                    <Col xs={{ size: 10, offset: 1 }} md={{ size: 6, offset: 3 }}>
                        <Card body className="text-center">
                            <CardTitle tag="h3"><em>{visit != null ? visit.specialist.title : ""}</em> visit queue</CardTitle>
                            <Row className="m-2">
                                <Col>
                                    <CardText tag="h5">Your visit code: <strong>{visit != null ? visit.code : ""}</strong></CardText>
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
                                    <Collapse isOpen={canCancel}>
                                        <Button outline color="danger" onClick={() => stomp.send("/app/cancel", {}, {})}>Cancel visit</Button>
                                    </Collapse>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
                <VisitsList visits={state.visits} visit={visit} />
            </Container>
        </div>
    );
}
export default Customer;