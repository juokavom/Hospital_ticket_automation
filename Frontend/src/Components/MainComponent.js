import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import {
    Row, Col, UncontrolledAlert
} from 'reactstrap';
import Menu from './MenuComponent';


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
    }, [cookies]);

    const checkFirstTimeVisitor = () => {
        let first = cookies.new;
        setCookie('new', true)
        return first !== undefined
    }

    return (
        <div>
            <div hidden={activeWindow !== "Customer"}>
                <h1>Customer ;)</h1>
            </div>
            <div hidden={activeWindow !== "Specialist"}>
                <h1>Specialist ;)</h1>
            </div>
            <div hidden={activeWindow !== "Main"}>
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
        </div >
    );

}
export default Main;