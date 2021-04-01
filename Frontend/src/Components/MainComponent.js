import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import {
    Row, Col, UncontrolledAlert, Container, Card, CardTitle, Collapse, Button
} from 'reactstrap';
import Menu from './MenuComponent';
import Customer from './CustomerComponent';
import Specialist from './SpecialistComponent';
import Screen from './ScreenComponent';
import { baseUrl, isInternalEP } from '../shared/APIEndpoints';


const Main = (props) => {
    const [cookies, setCookie] = useCookies(['new', 'customer', 'specialist']);
    const [activeWindow, setWindow] = useState("Main");
    const [isInternal, setIsInternal] = useState(null);
    const [isNew, setIsNew] = useState(null);

    const getUserInternalStatus = () => {
        fetch(baseUrl + isInternalEP).then(resp => resp.json()).then(ipStatus => setIsInternal(ipStatus));
    }

    const checkFirstTimeVisitor = () => {
        if(cookies.new === undefined) setIsNew(true)
        else setIsNew(false)
        setCookie('new', true)
    }

    useEffect(() => {
        if (cookies.customer !== undefined) {
            setWindow("Customer")
        } else if (cookies.specialist !== undefined) {
            setWindow("Specialist")
        } else {
            setWindow("Main")
        }
    }, [cookies.customer, cookies.specialist]);

    useEffect(() => {
        getUserInternalStatus();
        checkFirstTimeVisitor();
    }, []);


    if (activeWindow === "Customer") {
        return (
            <div>
                <Customer setWindow={(win) => setWindow(win)} />
            </div>
        );
    }
    else if (activeWindow === "Specialist") {
        return (
            <div>
                <Specialist setWindow={(win) => setWindow(win)} />
            </div >
        );
    }
    else if (activeWindow === "Screen") {
        return (
            <div>
                <Screen setWindow={(win) => setWindow(win)} />
            </div >
        );
    }

    else {
        return (
            <div>
                <Menu />
                <div>
                    <Collapse isOpen={isInternal}>
                        <Container>
                            <Row className="mt-5">
                                <Col sm="12" md={{ size: 8, offset: 2 }} lg={{ size: 6, offset: 3 }}>
                                    <Card body inverse className="text-center" style={{ backgroundColor: '#333', borderColor: '#333' }}>
                                        <CardTitle tag="h5">You are connected from internal network</CardTitle>
                                        <Row>
                                            <Col>
                                                <Button color="warning" onClick={() => { setWindow("Screen") }}><strong>Open department screen</strong></Button>
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