package com.hospital.ticket.controller;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import javax.management.DescriptorKey;
import java.security.Principal;
import java.util.logging.Logger;

@Controller
public class StompController {
    private final Logger LOG = Logger.getLogger(StompController.class.getName());

    @MessageMapping("/update")
    @SendTo("/queue/update")
    public String broadcastUpdate(@Payload String message, Principal principal) {
        LOG.info("Principal (id) = " + principal.getName() + ", message = " + message);

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
