import React, { useEffect, useReducer } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import {
    baseUrl, cancelStompEP, startStompEP, endStompEP, addStompEP, wsEP
} from '../shared/APIEndpoints';
import {
    Button, Card, CardTitle, Container, Row, Col
} from 'reactstrap';


const reducer = (state, action) => {
    switch (action.type) {
        case "cancel":
            if (state.due != null && state.due.length > 0) {
                var list = state.due.filter(i => i.id !== action.payload);
                return { ...state, due: list }
            }
            break;
        case "add":
            if (state.due != null) {
                state.due.push(action.payload)
                return { ...state, due: state.due }
            } else {
                return { ...state, due: [action.payload] }
            }
        case "end":
            if (state.active != null && state.active.length > 0) {
                var list = state.active.length > 1 ? state.active.filter(i => i.id !== action.payload) : null;
                return { ...state, active: list }
            }
            break;
        case "start":
            if (state.due != null && state.due.length > 0) {
                var node = state.due.filter(i => i.id === action.payload)[0];
                var dueList = state.due.length > 1 ? state.due.filter(i => i.id !== action.payload) : null;
                if (state.active != null) {
                    state.active.push(node)
                    return { ...state, due: dueList, active: state.active }
                } else {
                    return { ...state, due: dueList, active: [node] }
                }
            }
            break;
        case "setVisits":
            var dueList = action.payload.filter(i => i.status === "DUE")
            var activeList = action.payload.filter(i => i.status === "STARTED")
            dueList = dueList.length > 0 ? dueList : null
            activeList = activeList.length > 0 ? activeList : null
            return { ...state, due: dueList, active: activeList }
        case "updateStomp":
            return { ...state, stomp: action.payload }
        default: return;
    }
}


function Screen(props) {
    const [state, dispatch] = useReducer(reducer, { due: null, active: null, stomp: null });


    const registerSTOMP = () => {
        if (state.stomp == null) {
            var sock = new SockJS(baseUrl + wsEP);
            let stompClient = Stomp.over(sock);

            stompClient.connect({ 'Authorization': props.token }, () => {
                stompClient.subscribe(cancelStompEP, (message) => {
                    let body = JSON.parse(message.body)
                    dispatch({ type: "cancel", payload: parseInt(body) });
                });
                stompClient.subscribe(startStompEP, (message) => {
                    let body = JSON.parse(message.body)
                    dispatch({ type: "start", payload: parseInt(body) });
                });
                stompClient.subscribe(endStompEP, (message) => {
                    let body = JSON.parse(message.body)
                    dispatch({ type: "end", payload: parseInt(body) });
                });
                stompClient.subscribe(addStompEP, (message) => {
                    let body = JSON.parse(message.body)
                    dispatch({ type: "add", payload: body });
                });
            })
            stompClient.debug = null;
            dispatch({ type: "updateStomp", payload: stompClient });
        }
    }

    useEffect(() => {        
        dispatch({ type: "setVisits", payload: props.visits });
        registerSTOMP()
    }, [])

    if (state != null) {
        return (
            <div>
                <Container>
                    <Row className="mt-3 text-center">
                        <Col>
                            <Button color="secondary" onClick={() => {
                                dispatch({ type: "updateStomp", payload: state.stomp.disconnect() });
                                props.setWindow("Main")
                            }}>Go to main page</Button>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col>
                            <Card body className="text-center">
                                <CardTitle tag="h3">Upcomming 5 visits</CardTitle>
                            </Card>
                            <VisitsList visits={state.due != null ? state.due.length > 5 ? state.due.slice(0, 5) : state.due : null} class="ticketGrey ticket" />
                        </Col>
                        <Col>
                            <Card body className="text-center">
                                <CardTitle tag="h3">Active visits</CardTitle>
                            </Card>
                            <VisitsList visits={state.active} class="ticketGreen ticket" />
                        </Col>
                    </Row>
                </Container>
            </div >
        );
    } else {
        return (<div></div>);
    }

}
export default Screen;


function VisitsList(props) {
    let vList = []
    if (props.visits != null) {
        vList = props.visits.map(vis => {
            return (
                <Row key={vis.id} className="mt-5">
                    <Col xs={{ size: 10, offset: 1 }}>
                        <div className={props.class}>
                            <p style={{ fontSize: '40px' }}>
                                {vis.code.toUpperCase()}
                            </p>
                        </div>
                    </Col>
                </Row>);
        });
    }

    return (
        <div>
            {vList}
        </div>
    );
}