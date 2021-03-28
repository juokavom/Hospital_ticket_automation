import React, { useState } from 'react';
import { Button, Label, Card, CardTitle, CardText, DropdownItem, ButtonDropdown, DropdownToggle, DropdownMenu, UncontrolledButtonDropdown, Container, Row, Col } from 'reactstrap';
import SelectSearch from 'react-select-search';
import { GET } from '../shared/APICalls';

let specialistsList = []
GET('/specialists').then(resp => specialistsList = resp)

const publicIp = require('public-ip');

(async () => {
	console.log('My ip: ', await publicIp.v4()); //For department screens
})();

const Main = () => {
    const [dropdownOpen, setOpen] = useState(false);
    const [selectedSpecialist, setSpecialist] = useState("Select a specialist");    

    const specialists = specialistsList.map((s) => {
        return (
            <DropdownItem key={s} onClick={() => setSpecialist(s)}>{s}</DropdownItem>
        );
    });

    return (
        <Container>
            <Row className="mt-5">
                <Col sm="12" md={{ size: 8, offset: 3 }} lg={{ size: 6, offset: 3 }}>
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
                                <Button outline>Generate ticket</Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="text-left">
                                <Button color="link">Login as specialist</Button>
                            </Col>
                        </Row>

                    </Card>
                </Col>
            </Row>
        </Container>
    );

}
export default Main;