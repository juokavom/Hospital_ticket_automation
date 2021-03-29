import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import {
    Button, Card, CardTitle, CardText, DropdownItem, DropdownToggle, DropdownMenu, UncontrolledButtonDropdown, Container, Row, Col,
    Modal, ModalHeader, ModalBody, Form, FormGroup, Input, FormFeedback, Collapse, Alert, UncontrolledAlert
} from 'reactstrap';
import { GET, login } from '../shared/APICalls';

let specialistsList = []
GET('/specialists').then(resp => specialistsList = resp)

const publicIp = require('public-ip');

(async () => {
    console.log('My ip: ', await publicIp.v4()); //For department screens
})();

const Main = () => {
    const [dropdownOpen, setOpen] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [loginFailed, setLoginFailed] = useState(false);
    const [selectedSpecialist, setSpecialist] = useState("Select a specialist");
    const [inputTitle, setInputTitle] = useState({ title: "", valid: false, invalid: false });
    const [inputPassword, setInputPassword] = useState({ password: "", valid: false, invalid: false });
    const [cookies, setCookie, removeCookie] = useCookies(['new']);
    const [activeWindow, setWindow] = useState("Main");

    const specialists = specialistsList.map((s) => {
        return (
            <DropdownItem key={s} onClick={() => setSpecialist(s)}>{s}</DropdownItem>
        );
    });

    const checkFirstTimeVisitor = () => {
        let first = cookies.new;
        setCookie('new', true)
        return first != undefined
    }

    const handleLogin = (event) => {
        login({ title: inputTitle.title, password: inputPassword.password }).then(response => {
            if (response.status !== 200) {
                setLoginFailed(true)
            } else {
                setOpen(false);
                setModalOpen(false);
                setLoginFailed(false);
                setInputTitle({ title: "", valid: false, invalid: false });
                setInputPassword({ password: "", valid: false, invalid: false });

                let jwt = response.headers.get("Authorization")
            }
        })
        event.preventDefault();
    }

    return (
        <div hidden={activeWindow != "Main"}>
            <Container>
                <Modal isOpen={isModalOpen} toggle={() => setModalOpen(!isModalOpen)}>
                    <ModalHeader toggle={() => setModalOpen(!isModalOpen)}>Specialist login</ModalHeader>
                    <ModalBody>
                        <Form>
                            <Alert isOpen={loginFailed} color="danger">
                                Login failed! Please check title and password and try again!
                        </Alert>
                            <FormGroup>
                                <Input type="text" id="title" name="title"
                                    placeholder="Title" value={inputTitle.title}
                                    valid={inputTitle.valid}
                                    invalid={inputTitle.invalid}
                                    onChange={(event) => {
                                        let spec = event.target.value
                                        let check = spec.length > 3
                                        let exist = specialistsList.includes(spec)
                                        setInputTitle({ title: spec, valid: check && exist, invalid: check && !exist })
                                    }} />
                                <FormFeedback valid>Specialist found!</FormFeedback>
                                <FormFeedback invalid="true">Specialist wasn't found!</FormFeedback>
                            </FormGroup>
                            <FormGroup>
                                <Input type="password" id="password" name="password"
                                    placeholder="Password" value={inputPassword.password}
                                    valid={inputPassword.valid}
                                    invalid={inputPassword.invalid}
                                    onChange={(event) => {
                                        let psw = event.target.value
                                        let check = psw.length > 5
                                        setInputPassword({ password: psw, valid: check, invalid: !check })
                                    }} />
                                <FormFeedback invalid="true">Password must be longer than 5 characters!</FormFeedback>
                            </FormGroup>
                            <FormGroup>
                                <Row className="justify-content-md-center">
                                    <Col md="auto">
                                        <Collapse isOpen={inputTitle.valid && inputPassword.valid}>
                                            <Button outline type="submit" color="primary" onClick={handleLogin}>Login</Button>
                                        </Collapse>
                                    </Col>
                                </Row>
                            </FormGroup>
                        </Form>
                    </ModalBody>
                </Modal>
                <Row className="mt-5">
                    <Col sm="12" md={{ size: 8, offset: 2 }} lg={{ size: 6, offset: 3 }}>
                        <Card body className="text-center">
                            <CardTitle tag="h5">Ticket generator</CardTitle>
                            <CardText>Select a specialist and generate ticket for the visit</CardText>
                            <Row>
                                <Col>
                                    <UncontrolledButtonDropdown isOpen={dropdownOpen} toggle={() => setOpen(!dropdownOpen)}>
                                        <DropdownToggle caret>{selectedSpecialist}</DropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem header>Specialists</DropdownItem>
                                            {specialists}
                                        </DropdownMenu>
                                    </UncontrolledButtonDropdown>
                                </Col>
                            </Row>
                            <Row>
                                <Col className="m-3">
                                    <Button disabled={selectedSpecialist == "Select a specialist"} outline>Generate ticket</Button>
                                </Col>
                            </Row>
                            <Row>
                                <Col className="text-left">
                                    <Button color="link" onClick={() => setModalOpen(!isModalOpen)}>Login as specialist</Button>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
                <div hidden={checkFirstTimeVisitor()}>
                    <Row className="mt-5">
                        <Col sm="12" md={{ size: 10, offset: 1 }} lg={{ size: 8, offset: 2 }}>
                            <UncontrolledAlert color="secondary text-center">
                                <p>We use cookies to provide best quality services to our users.</p><p>By using this website you agree to our cookie policy.</p>
                            </UncontrolledAlert>
                        </Col>
                    </Row>
                </div>
            </Container>
        </div>
    );

}
export default Main;