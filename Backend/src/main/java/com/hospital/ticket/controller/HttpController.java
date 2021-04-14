package com.hospital.ticket.controller;

import com.hospital.ticket.constants.SecurityConstants;
import com.hospital.ticket.model.DueAndStartedVisits;
import com.hospital.ticket.model.Specialist;
import com.hospital.ticket.model.SpecialistWithJWT;
import com.hospital.ticket.model.Visit;
import com.hospital.ticket.repository.SpecialistRepository;
import com.hospital.ticket.repository.VisitRepository;
import com.hospital.ticket.utils.JWTToken;
import com.hospital.ticket.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@RestController
public class HttpController {
    private final Logger LOG =
            Logger.getLogger(HttpController.class.getName());
    @Autowired
    private SimpMessagingTemplate msgTemplate;

    @Autowired
    private SpecialistRepository specialistRepository;

    @Autowired
    private VisitRepository visitRepository;

    @GetMapping("/specialists")
    public @ResponseBody
    List<Specialist> getSpecialists() {
        List<Specialist> specialists = (List<Specialist>) specialistRepository.findAll();
        Collections.sort(specialists);
        return specialists;
    }

    @PostMapping("/login")
    public SpecialistWithJWT getSpecialistDetailsAfterLogin(Principal principal, HttpServletResponse response) {
        Optional<Specialist> specialistOpt = specialistRepository.findById(Long.parseLong(principal.getName()));
        if (specialistOpt.isPresent()) {
            response.setStatus(200);
            return new SpecialistWithJWT(response.getHeader("Authorization"), specialistOpt.get());
        } else {
            response.setStatus(404);
            return null;
        }
    }

    @PostMapping("/visit/generate")
    @SendTo("/queue/add/{id}")
    public void generateNewVisit(@RequestBody Long id, HttpServletResponse response) {
        Optional<Specialist> specialistOpt = specialistRepository.findById(id);
        Specialist specialist = null;
        if (specialistOpt.isPresent()) {
            specialist = specialistOpt.get();
        } else {
            response.setStatus(404);
            return;
        }
        String lastVisitTime = visitRepository.findLastActiveVisitTime(specialist.getId());
        String visitTime = Utils.generateTime(lastVisitTime, specialist.getTimeForVisit());
        if (visitTime == null) {
            response.setStatus(500);
            return;
        }
        response.setStatus(200);
        Visit newVisit = new Visit(visitTime, specialist);
        visitRepository.save(newVisit);
        String preset = "";
        if (newVisit.getId() < 10) preset = "00";
        else if (newVisit.getId() < 100) preset = "0";
        newVisit.setCode(newVisit.getCode() + preset + newVisit.getId());
        visitRepository.save(newVisit);
        response.setHeader(SecurityConstants.JWT_HEADER, JWTToken.generate(newVisit.getId().toString(), SecurityConstants.CUSTOMER));
        msgTemplate.convertAndSend("/queue/add/" + specialist.getId(), newVisit);
        msgTemplate.convertAndSend("/queue/add/", newVisit);
    }

    @GetMapping("/visit")
    public Visit getVisit(Principal principal, HttpServletResponse response) {
        Optional<Visit> visitOpt = visitRepository.findById(Long.parseLong(principal.getName()));
        Visit visit = null;
        if (visitOpt.isPresent()) {
            visit = visitOpt.get();
        } else {
            response.setStatus(404);
            return null;
        }
        response.setStatus(200);
        return visit;
    }

    @GetMapping("/specialist/visits/active")
    public List<Visit> getVisits(Principal principal, HttpServletResponse response) {
        Optional<Visit> visitOpt = visitRepository.findById(Long.parseLong(principal.getName()));
        Visit visit = null;
        if (visitOpt.isPresent()) {
            visit = visitOpt.get();
        } else {
            response.setStatus(404);
            return null;
        }
        List<Visit> activeVisits = visitRepository.findActiveVisitsBefore(visit.getSpecialist().getId(), visit.getId());
        response.setStatus(200);
        return activeVisits;
    }

    @GetMapping("/specialist/visits")
    public List<Visit> getSpecialistsVisits(Principal principal, HttpServletResponse response) {
        Optional<Specialist> specialistOpt = specialistRepository.findById(Long.parseLong(principal.getName()));
        Specialist specialist = null;
        if (specialistOpt.isPresent()) {
            specialist = specialistOpt.get();
        } else {
            response.setStatus(404);
            return null;
        }
        List<Visit> activeVisits = visitRepository.findAllActiveSpecialistVisits(specialist.getId());
        response.setStatus(200);
        return activeVisits;
    }

    @GetMapping("/department/token")
    public @ResponseBody
    String getDepartmentToken(HttpServletResponse response) {
        response.setStatus(200);
        return JWTToken.generate(SecurityConstants.SCREEN, SecurityConstants.SCREEN);
    }

    @GetMapping("/department/visits")
    public DueAndStartedVisits getDepartmentVisits(HttpServletResponse response) {
        response.setStatus(200);
        return new DueAndStartedVisits(visitRepository.findDueVisitsWithLimit(5),
                visitRepository.findAllStartedVisits());
    }
}
