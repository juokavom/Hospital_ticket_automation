import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import {
    Row, Col, UncontrolledAlert, Container, Card, CardTitle, CardText, Button
} from 'reactstrap';
import Menu from './MenuComponent';
import Customer from './CustomerComponent';
import Specialist from './SpecialistComponent';


const Main = (props) => {
    const [cookies, setCookie] = useCookies(['new', 'customer', 'specialist']);
    const [activeWindow, setWindow] = useState("Main");
    const [isInternal, setIsInternal] = useState(null);

    const getUserInternalStatus = () => {
        fetch("http://localhost:8080/isInternal").then(resp => resp.json()).then(ipStatus => setIsInternal(ipStatus));
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
    }, []);

    const checkFirstTimeVisitor = () => {
        let first = cookies.new;
        setCookie('new', true)
        return first !== undefined
    }

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

    else {
        return (
            <div>
                <Menu />
                <div>
                    <Container>
                        <Row className="mt-5">
                            <Col sm="12" md={{ size: 8, offset: 2 }} lg={{ size: 6, offset: 3 }}>
                                <Card body inverse className="text-center" style={{ backgroundColor: '#333', borderColor: '#333' }}>
                                    <CardTitle tag="h5">You are connected from internal network</CardTitle>
                                    <Row>
                                        <Col>
                                            <Button color="warning"><strong>Open visit displayer</strong></Button>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <div hidden={checkFirstTimeVisitor()}>
                    <Row className="mt-5">
                        <Col sm="12" md={{ size: 10, offset: 1 }} lg={{ size: 8, offset: 2 }}>
                            <UncontrolledAlert color="secondary text-center">
                                <p>We use cookies to provide best quality services to our users.</p><p>By using this website you agree to our cookie policy.</p>
                            </UncontrolledAlert>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }

}
export default Main;