import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import {
    Row, Col, UncontrolledAlert
} from 'reactstrap';
import Menu from './MenuComponent';
import Customer from './CustomerComponent';
import Specialist from './SpecialistComponent';


// const publicIp = require('public-ip');
// (async () => {
//     console.log('My ip: ', await publicIp.v4()); //For department screens
// })();


const Main = (props) => {
    const [cookies, setCookie] = useCookies(['new', 'customer', 'specialist']);
    const [activeWindow, setWindow] = useState("Main");

    useEffect(() => {
        if (cookies.customer !== undefined) {
            setWindow("Customer")
        } else if (cookies.specialist !== undefined) {
            setWindow("Specialist")
        } else {
            setWindow("Main")
        }
    }, [cookies.customer, cookies.specialist]);

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