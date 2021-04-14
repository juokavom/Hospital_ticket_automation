import React, { useEffect, useReducer } from 'react';
import { useCookies } from 'react-cookie';
import {
    Row, Col, UncontrolledAlert, Container, Card, CardTitle, Collapse, Button
} from 'reactstrap';
import Menu from './MenuComponent';
import Customer from './CustomerComponent';
import Specialist from './SpecialistComponent';
import Screen from './ScreenComponent';
import { internalIP } from '../shared/APIEndpoints';

const publicIp = require('public-ip');
const isNew = localStorage.getItem('new') === null;
if (isNew) localStorage.setItem('new', JSON.stringify(false));

const reducer = (state, action) => {
    switch (action.type) {
        case "setWindow":
            return { ...state, activeWindow: action.payload }
        case "setNew":
            return { ...state, newVisitor: true }
        case "setIP":
            return { ...state, ip: action.payload }
        default: return;
    }
}

const Main = () => {
    const [cookies,] = useCookies(['customer', 'specialist']);
    const [state, dispatch] = useReducer(reducer, {
        activeWindow: "Main", newVisitor: false, ip: null
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
        if (cookies.customer !== undefined) {
            dispatch({ type: "setWindow", payload: "Customer" });
        } else if (cookies.specialist !== undefined) {
            dispatch({ type: "setWindow", payload: "Specialist" });
        } else {
            dispatch({ type: "setWindow", payload: "Main" });
        }
    }, []);



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
                <Screen setWindow={(win) => dispatch({ type: "setWindow", payload: win })} />
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
                                                <Button color="warning" onClick={() => dispatch({ type: "setWindow", payload: "Screen" })}>
                                                    <strong>Open department screen</strong></Button>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            </Row>
                        </Container>
                    </Collapse>
                </div>
                <Collapse isOpen={isNew}>
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