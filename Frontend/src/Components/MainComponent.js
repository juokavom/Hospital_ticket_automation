import React, { Component } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs'; //requires dependency
import {Button} from 'reactstrap'; //requires dependency

var sock = new SockJS('http://localhost:8080/ticket');
let stompClient = Stomp.over(sock);
// stompClient.debug = null;

stompClient.connect({'Authorization':'eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJIVEEiLCJzdWIiOiJKV1QgVG9rZW4iLCJ1c2VybmFtZSI6IjEwMSIsImF1dGhvcml0aWVzIjoiQ1VTVE9NRVIiLCJpYXQiOjE2MTY5NDI4NjEsImV4cCI6MTYxOTk0Mjg2MX0.Ay6Xm2Pm9g_aFfeZkf_QzNwwZPifBLjGmsDvT4X9hLk'}, function () {
    stompClient.subscribe("/queue/update", (message) => {
        console.log('/queue/update =  ', message.body);
    });
}, function (error) {
    console.log("STOMP protocol error: " + error);
});

class Main extends Component {
    // constructor(props) {
    //     super(props);

    // }

    render() {
        return (
            <div>
                <h1>Lorem Ipsum</h1>
                <Button onClick={() => stompClient.send("/app/update", {}, "HI guyz :-)")}>
                    Send message
                </Button>
            </div >
        );
    }


}
export default Main;
// export default connect(mapStateToProps, mapDispatchToProps)(Main);