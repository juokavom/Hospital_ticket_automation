package com.hospital.ticket.controller;

import com.hospital.ticket.constants.VisitStatus;
import com.hospital.ticket.model.CancelledVisit;
import com.hospital.ticket.model.Visit;
import com.hospital.ticket.repository.SpecialistRepository;
import com.hospital.ticket.repository.VisitRepository;
import com.hospital.ticket.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@Controller
public class StompController {
    private final Logger LOG = Logger.getLogger(StompController.class.getName());

    @Autowired
    private SimpMessagingTemplate msgTemplate;

    @Autowired
    private SpecialistRepository specialistRepository;

    @Autowired
    private VisitRepository visitRepository;

    @MessageMapping("/cancel/{id}")
    @SendTo("/queue/cancel/{id}")
    public CancelledVisit cancelTicket(@Payload String message, Authentication auth, @DestinationVariable Long id) {
        Optional<Visit> visitOpt = visitRepository.findById(Long.parseLong(message));
        Visit visit = null;
        if (visitOpt.isPresent()) {
            visit = visitOpt.get();
        } else return null;
        visit.setStatus(VisitStatus.CANCELLED);
        List<Visit> activeVisits = Utils.recalculateTime(visitRepository, visit);
        visitRepository.save(visit);
        msgTemplate.convertAndSend("/queue/cancel/", visit.getId());
        return new CancelledVisit(visit.getId().toString(), activeVisits);
    }

    @MessageMapping("/start/{id}")
    @SendTo("/queue/start/{id}")
    public Visit startTicket(@Payload String message, Authentication auth, @DestinationVariable Long id) {
        Optional<Visit> visitOpt = visitRepository.findById(Long.parseLong(message));
        Visit visit = null;
        if (visitOpt.isPresent()) {
            visit = visitOpt.get();
        } else return null;
        visit.setStatus(VisitStatus.STARTED);
        visitRepository.save(visit);
        msgTemplate.convertAndSend("/queue/start/", visit.getId());
        return visit;
    }

    @MessageMapping("/end/{id}")
    @SendTo("/queue/end/{id}")
    public Visit endTicket(@Payload String message, Authentication auth, @DestinationVariable Long id) {
        Optional<Visit> visitOpt = visitRepository.findById(Long.parseLong(message));
        Visit visit = null;
        if (visitOpt.isPresent()) {
            visit = visitOpt.get();
        } else return null;
        visit.setStatus(VisitStatus.ENDED);
        visitRepository.save(visit);
        msgTemplate.convertAndSend("/queue/end/", visit.getId());
        return visit;
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
