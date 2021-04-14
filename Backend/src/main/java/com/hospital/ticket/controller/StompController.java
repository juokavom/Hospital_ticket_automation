package com.hospital.ticket.controller;

import com.google.common.collect.Iterables;
import com.hospital.ticket.constants.SecurityConstants;
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
            if (visit.getStatus() != VisitStatus.DUE) return null; //Proceed if visit status is DUE
        } else return null;

        //Proceed if person that called 'cancel' has 'SPECIALIST' authorities
        if (Iterables.get(auth.getAuthorities(), 0).toString().equals(SecurityConstants.SPECIALIST)) {
            //Proceed if specialist that called 'cancel' has this visit
            if (visitRepository.getSpecVisitJoinCount(visit.getId(), Long.parseLong(auth.getPrincipal().toString())) != 1)
                return null;
        }
        //Proceed if person that called 'cancel' has 'CUSTOMER' authorities
        else if (Iterables.get(auth.getAuthorities(), 0).toString().equals(SecurityConstants.CUSTOMER)) {
            //Proceed if customer that called 'cancel' is this visit
            if (!auth.getPrincipal().toString().equals(message)) return null;
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
        //Proceed if person that called 'start' has 'SPECIALIST' authorities
        if (!Iterables.get(auth.getAuthorities(), 0).toString().equals(SecurityConstants.SPECIALIST)) return null;

        //Proceed if there are no started visits
        if (visitRepository.getSpecStartedVisitCount(id) != 0) return null;

        Optional<Visit> visitOpt = visitRepository.findById(Long.parseLong(message));
        Visit visit = null;
        if (visitOpt.isPresent()) {
            visit = visitOpt.get();
            if (visit.getStatus() != VisitStatus.DUE) return null; //Proceed if visit exists and status is DUE
        } else return null;

        //Proceed if specialist that called 'start' has this visit
        if (visitRepository.getSpecVisitJoinCount(visit.getId(), Long.parseLong(auth.getPrincipal().toString())) != 1)
            return null;

        visit.setStatus(VisitStatus.STARTED);
        visitRepository.save(visit);
        msgTemplate.convertAndSend("/queue/start/", visit.getId());
        return visit;
    }

    @MessageMapping("/end/{id}")
    @SendTo("/queue/end/{id}")
    public Visit endTicket(@Payload String message, Authentication auth, @DestinationVariable Long id) {
        //Proceed if person that called 'end' has 'SPECIALIST' authorities
        if (!Iterables.get(auth.getAuthorities(), 0).toString().equals(SecurityConstants.SPECIALIST)) return null;

        Optional<Visit> visitOpt = visitRepository.findById(Long.parseLong(message));
        Visit visit = null;
        if (visitOpt.isPresent()) {
            visit = visitOpt.get();
            if (visit.getStatus() != VisitStatus.STARTED) return null; //Proceed if visit exists and status is STARTED
        } else return null;

        //Proceed if specialist that called 'end' has this visit
        if (visitRepository.getSpecVisitJoinCount(visit.getId(), Long.parseLong(auth.getPrincipal().toString())) != 1)
            return null;

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
