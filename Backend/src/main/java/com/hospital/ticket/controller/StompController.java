package com.hospital.ticket.controller;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.logging.Logger;

@Controller
public class StompController {
    private final Logger LOG = Logger.getLogger(StompController.class.getName());

    @MessageMapping("/update")
    @SendTo("/queue/update")
    public String broadcastUpdate(@Payload String message){
        return message;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        LOG.info("Received a new web socket connection" + event.toString());
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        LOG.info("Socket disconnected!");
    }
}
