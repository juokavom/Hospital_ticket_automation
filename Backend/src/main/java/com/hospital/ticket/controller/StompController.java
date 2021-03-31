package com.hospital.ticket.controller;

import com.hospital.ticket.constants.VisitStatus;
import com.hospital.ticket.model.Visit;
import com.hospital.ticket.repository.SpecialistRepository;
import com.hospital.ticket.repository.VisitRepository;
import org.apache.juli.logging.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import javax.management.DescriptorKey;
import java.security.Principal;
import java.util.Optional;
import java.util.logging.Logger;

@Controller
public class StompController {
    private final Logger LOG = Logger.getLogger(StompController.class.getName());

    @Autowired
    private SpecialistRepository specialistRepository;

    @Autowired
    private VisitRepository visitRepository;

    @MessageMapping("/cancel")
    @SendTo("/queue/cancel")
    public String cancelTicket(@Payload String message, Principal customer, Authentication auth) {
        Optional<Visit> visitOpt = visitRepository.findById(Long.parseLong(customer.getName()));
        Visit visit = null;
        if (visitOpt.isPresent()) {
            visit = visitOpt.get();
        } else return "";
        visit.setStatus(VisitStatus.CANCELLED);
        //TODO recalculate times for other visits, affected by this cancellation
        visitRepository.save(visit);
        return visit.getId().toString();
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
