import React, { useEffect, useReducer } from 'react';
import { useCookies } from 'react-cookie';
import {
    Row, Col, UncontrolledAlert, Container, Card, CardTitle, Collapse, Button
} from 'reactstrap';
import Menu from './MenuComponent';
import Customer from './CustomerComponent';
import Specialist from './SpecialistComponent';
import Screen from './ScreenComponent';
import { baseUrl, internalIP, allActiveVisitsEP } from '../shared/APIEndpoints';

const publicIp = require('public-ip');

const reducer = (state, action) => {
    switch (action.type) {
        case "department":
            return { ...state, allVisits: action.payload.allVisits, token: action.payload.token, activeWindow: "Screen" }
        case "setWindow":
            return { ...state, activeWindow: action.payload }
        case "setNew":
            return { ...state, newVisitor: true }
        case "setIP":
            return { ...state, ip: action.payload }
        default: return;
    }
}

const Main = (props) => {
    const [cookies, setCookie] = useCookies(['new', 'customer', 'specialist']);
    const [state, dispatch] = useReducer(reducer, {
        allVisits: null, token: null, activeWindow: "Main", newVisitor: false, ip: null
    });

    const getUserIp = () => {
        (async () => {
            dispatch({ type: "setIP", payload: await publicIp.v4() });
        })();
    }

    useEffect(() => {
        getUserIp();
    }, [state.activeWindow]);

    useEffect(() => {
        if (cookies.new === undefined) {
            dispatch({ type: "setNew" });
            setCookie('new', true)
        }
        if (cookies.customer !== undefined) {
            dispatch({ type: "setWindow", payload: "Customer" });
        } else if (cookies.specialist !== undefined) {
            dispatch({ type: "setWindow", payload: "Specialist" });
        } else {
            dispatch({ type: "setWindow", payload: "Main" });
        }
    }, []);

    const getAllVisits = () => {
        fetch(baseUrl + allActiveVisitsEP)
            .then(response => {
                if (response.status === 200) {
                    return response;
                }
            })
            .then(response => response.json())
            .then(response => {
                dispatch({ type: "department", payload: response });
            })
    }

    if (state.activeWindow === "Customer") {
        return (
            <div>
                <Customer setWindow={(win) => dispatch({ type: "setWindow", payload: win })} />
            </div>
        );
    }
    else if (state.activeWindow === "Specialist") {
        return (
            <div>
                <Specialist setWindow={(win) => dispatch({ type: "setWindow", payload: win })} />
            </div >
        );
    }
    else if (state.activeWindow === "Screen") {
        return (
            <div>
                <Screen visits={state.allVisits} token={state.token} setWindow={(win) => dispatch({ type: "setWindow", payload: win })} />
            </div >
        );
    }

    else {
        return (
            <div>
                <Menu setWindow={(win) => dispatch({ type: "setWindow", payload: win })} />
                <div>
                    <Collapse isOpen={state.ip != null && state.ip === internalIP}>
                        <Container>
                            <Row className="mt-5">
                                <Col sm="12" md={{ size: 8, offset: 2 }} lg={{ size: 6, offset: 3 }}>
                                    <Card body inverse className="text-center" style={{ backgroundColor: '#333', borderColor: '#333' }}>
                                        <CardTitle tag="h5">You are connected from internal network</CardTitle>
                                        <Row>
                                            <Col>
                                                <Button color="warning" onClick={() => getAllVisits()}><strong>Open department screen</strong></Button>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            </Row>
                        </Container>
                    </Collapse>
                </div>
                <Collapse isOpen={state.newVisitor}>
                    <Row className="mt-5">
                        <Col sm="12" md={{ size: 10, offset: 1 }} lg={{ size: 8, offset: 2 }}>
                            <UncontrolledAlert color="secondary text-center">
                                <p>We use cookies to provide best quality services to our users.</p><p>By using this website you agree to our cookie policy.</p>
                            </UncontrolledAlert>
                        </Col>
                    </Row>
                </Collapse>
            </div>
        );
    }

}
export default Main;