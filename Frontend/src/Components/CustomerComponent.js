import React, { Component, useState, useEffect, useReducer } from 'react';
import { useCookies } from 'react-cookie';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs'; //requires dependency
import { baseUrl } from '../shared/baseUrl';
import Timer from './CounterComponent';
import { useTimer } from 'react-timer-hook';
import {
    Button, Card, CardTitle, CardText, DropdownItem, DropdownToggle, DropdownMenu, UncontrolledButtonDropdown, Container, Row, Col,
    Modal, ModalHeader, ModalBody, Form, FormGroup, Input, FormFeedback, Collapse, Alert, Label
} from 'reactstrap';

// var sock = new SockJS(baseUrl + '/ticket');
// let stompClient = Stomp.over(sock);
// // stompClient.debug = null;

// stompClient.connect({ 'Authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJIVEEiLCJzdWIiOiJKV1QgVG9rZW4iLCJ1c2VybmFtZSI6IjEwMSIsImF1dGhvcml0aWVzIjoiQ1VTVE9NRVIiLCJpYXQiOjE2MTY5NDI4NjEsImV4cCI6MTYxOTk0Mjg2MX0.Ay6Xm2Pm9g_aFfeZkf_QzNwwZPifBLjGmsDvT4X9hLk' }, function () {
//     stompClient.subscribe("/queue/update", (message) => {
//         console.log('/queue/update =  ', message.body);
//     });
// }, function (error) {
//     console.log("STOMP protocol error: " + error);
// });

/* <Button onClick={() => stompClient.send("/app/update", {}, "HI guyz :-)")}>
    Send message
    </Button> */




function Customer(props) {
    const [cookies, setCookie] = useCookies(['customer']);
    const [visit, setVisit] = useState(null);
    const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        setTime({ hours: 19, minutes: 0, seconds: 0 })
        console.log(visit)
    }, [visit])

    // useEffect(() => {        

    // }, [time])

    useEffect(() => {
        if (cookies.customer !== undefined) {
            return fetch(baseUrl + "/visit", {
                method: 'GET',
                headers: {
                    'Authorization': cookies.customer,
                    'Content-Type': 'application/json'
                },
            })
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
    }, [cookies]);

    return (
        <Container>
            <Row className="mt-5">
                <Col sm="16" md={{ size: 12, offset: 0 }} lg={{ size: 10, offset: 1 }}>
                    <Card body className="text-center">
                        <CardTitle tag="h3"><em>{visit != null? visit.specialist.title:""}</em> visit queue</CardTitle>
                        <Row className="m-2">
                            <Col>
                                <CardText tag="h5">Your visit code: <strong>{visit != null? visit.code:""}</strong></CardText>
                            </Col>
                        </Row>
                        <Row className="m-2">
                            <Col>
                                <CardText>Time for your visit
                                : <strong>{time.hours}:{time.minutes < 10 ? "0" : ""}{time.minutes}</strong></CardText>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Timer time={time} />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
export default Customer;