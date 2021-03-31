import React from 'react';
import {
    Row, Col
} from 'reactstrap';

function VisitsList(props) {
    let vList = []
    if(props.visits != null){
        vList = props.visits.map(vis => {
            let color = vis.status === "DUE" ? "ticketGrey" : "ticketGreen";
            color = vis.id === props.visit.id ? "ticketBlue" : color
            color += " ticket"
            return (
                <Row key={vis.id} className="mt-5">
                    <Col xs={{ size: 6, offset: 3 }} md={{ size: 4, offset: 4 }}>
                        <div className={color}>{vis.code.toUpperCase()} <em>({vis.status.toLowerCase()})</em></div>
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
export default VisitsList;