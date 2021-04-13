import React, { useEffect, useReducer } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import {
    baseUrl, cancelStompEP, startStompEP, endStompEP,
    addStompEP, wsEP, allActiveVisitsEP, departmentTokenEP
} from '../shared/APIEndpoints';
import {
    Button, Card, CardTitle, Container, Row, Col
} from 'reactstrap';
import { GETRequest } from '../shared/APICalls';


const reducer = (state, action) => {
    switch (action.type) {
        case "setVisits":
            var dueList = action.payload.dueVisits
            var activeList = action.payload.startedVisits
            dueList = dueList.length > 0 ? dueList : null
            activeList = activeList.length > 0 ? activeList : null
            return { ...state, due: dueList, active: activeList }
        case "updateStomp":
            return { ...state, stomp: action.payload }
        case "setToken":
            return { ...state, token: action.payload }
        default: return;
    }
}


function Screen(props) {
    const [state, dispatch] = useReducer(reducer, {
        due: null, active: null, stomp: null, token: null
    });


    const registerSTOMP = () => {
        if (state.stomp == null) {
            var sock = new SockJS(baseUrl + wsEP);
            let stompClient = Stomp.over(sock);

            stompClient.connect({ 'Authorization': state.token }, () => {
                stompClient.subscribe(cancelStompEP, () => {
                    //Refresh visits if any one was cancelled
                    getVisits();
                });
                stompClient.subscribe(startStompEP, () => {
                    //Refresh visits if any one was started
                    getVisits();
                });
                stompClient.subscribe(endStompEP, () => {
                    //Refresh visits if any one was ended
                    getVisits();
                });
                stompClient.subscribe(addStompEP, () => {
                    //Refresh visits if any one was added
                    getVisits();
                });
            })
            stompClient.debug = null;
            dispatch({ type: "updateStomp", payload: stompClient });
        }
    }

    const getToken = () => {
        fetch(baseUrl + departmentTokenEP)
            .then(response => {
                if (response.status === 200) {
                    return response;
                }
            })
            .then(response => response.text())
            .then(response => {
                dispatch({ type: "setToken", payload: response });
            })
    }

    const getVisits = async () => {
        dispatch({
            type: "setVisits",
            payload: await GETRequest(allActiveVisitsEP, state.token)
                .then(response => {
                    if (response.status === 200) {
                        return response;
                    }
                })
                .then(response => response.json())
        });
    }
    useEffect(() => {
        if (state.token != null) {
            getVisits();
            registerSTOMP();
        }
    }, [state.token])

    useEffect(() => {
        getToken();
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
                                <CardTitle tag="h3">Upcoming 5 visits</CardTitle>
                            </Card>
                            <VisitsList visits={state.due} class="ticketGrey ticket" />
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