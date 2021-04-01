import React, { useState, useEffect, useReducer } from 'react';
import { useCookies } from 'react-cookie';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import {
    baseUrl, cancelActionEP, cancelStompEP, startStompEP, endStompEP, addStompEP,
    endActionEP, startActionEP, allActiveVisitsEP, wsEP
} from '../shared/APIEndpoints';
import { useAlert } from 'react-alert';
import {
    Button, Card, CardTitle, CardText, Container, Row, Col, Collapse, Table
} from 'reactstrap';


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

function Screen(props) {
    const [cancelledVisit, setCancelledVisit] = useState({ id: null, affectedVisits: null });
    const [addedVisit, setAddedVisit] = useState({ affectedVisit: null });
    const alert = useAlert(null)
    const [state, dispatch] = useReducer(reducer, { visits: null, stomp: null, inited: false });
    const [cookies, setCookie, unsetCookie] = useCookies(['screen']);


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

        stompClient.connect({ 'Authorization': cookies.screen }, () => {
            stompClient.subscribe(cancelStompEP, (message) => {
                let body = JSON.parse(message.body)
                setCancelledVisit({ id: parseInt(body.visit), affectedVisits: body.affectedVisits });
            });
            stompClient.subscribe(startStompEP, (message) => {
                let body = JSON.parse(message.body)
                dispatch({ type: "startVisit", payload: parseInt(body.id) });
            });
            stompClient.subscribe(endStompEP, (message) => {
                let body = JSON.parse(message.body)
                dispatch({ type: "endVisit", payload: parseInt(body.id) });
                dispatch({ type: "cancelVisit", payload: parseInt(body.id) });
            });
            stompClient.subscribe(addStompEP, (message) => {
                let body = JSON.parse(message.body)
                setAddedVisit({ affectedVisit: body });
            });
        })
        // stompClient.debug = null;
        dispatch({ type: "updateStomp", payload: stompClient });
    }

    const fetchVisits = async () => {
        fetch(baseUrl + allActiveVisitsEP)
            .then(response => {
                if (response.status === 200) {
                    return response;
                }
            }).then(response => response.json()).then(response => {
                setCookie('screen', response.token);
                unsetCookie('specialist')
                unsetCookie('customer')
                dispatch({ type: "setVisits", payload: response.allVisits });
            })

    }

    useEffect(() => {
        return (registerSTOMP(), fetchVisits())
    }, [])


    return (
        <div>
            <Container>
                <Row className="mt-5">
                    <Col>
                        <Card body className="text-center">
                            <CardTitle tag="h3">Due visits</CardTitle>
                            {/* <VisitTable visits={state.visits} specialist={getSpecialist} stomp={state.stomp} /> */}
                        </Card>
                    </Col>
                    <Col>
                        <Card body className="text-center">
                            <CardTitle tag="h3">Active visits</CardTitle>
                            {/* <VisitTable visits={state.visits} specialist={getSpecialist} stomp={state.stomp} /> */}
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div >
    );

    // let vList = []
    // if(props.visits != null){
    //     vList = props.visits.map(vis => {
    //         let color = "ticketGrey"
    //         if(vis.id === props.visit.id) color = "ticketBlue";
    //         if(vis.status === "STARTED") color = "ticketGreen";
    //         color += " ticket"
    //         return (
    //             <Row key={vis.id} className="mt-5">
    //                 <Col xs={{ size: 6, offset: 3 }} md={{ size: 4, offset: 4 }}>
    //                     <div className={color}>{vis.code.toUpperCase()} <em>({vis.status.toLowerCase()})</em></div>
    //                 </Col>
    //             </Row>);
    //     });
    // }

}
export default Screen;