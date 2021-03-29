package com.hospital.ticket.controller;

import com.hospital.ticket.constants.SecurityConstants;
import com.hospital.ticket.model.Specialist;
import com.hospital.ticket.model.Visit;
import com.hospital.ticket.repository.SpecialistRepository;
import com.hospital.ticket.repository.VisitRepository;
import com.hospital.ticket.utils.JWTToken;
import com.hospital.ticket.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.security.Principal;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.LocalTime;
import java.util.*;
import java.util.logging.Logger;

import static java.time.LocalTime.now;

@RestController
public class SpecialistController {
    private final Logger LOG =
            Logger.getLogger(SpecialistController.class.getName());

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

    @RequestMapping("/login")
    public Specialist getSpecialistDetailsAfterLogin(Principal specialist) {
        List<Specialist> specialists = specialistRepository.findByTitle(specialist.getName());
        if (specialists.size() > 0) {
            return specialists.get(0);
        } else {
            return null;
        }

    }

    @GetMapping("/visit/generate")
    public void generateNewVisit(@RequestParam("id") Long id, HttpServletResponse response) {
        Optional<Specialist> specialistOpt = specialistRepository.findById(id);
        Specialist specialist = null;
        if (specialistOpt.isPresent()) {
            specialist = specialistOpt.get();
        } else {
            response.setStatus(404);
            return;
        }
        List<Visit> specialistVisits = visitRepository.findBySpecialistId(specialist.getId());
        Visit lastVisit = specialistVisits.stream().count() > 0 ?
                specialistVisits.get((int)(specialistVisits.stream().count() - 1)) : null;
        String visitTime = Utils.generateTime(lastVisit, specialist.getTimeForVisit());
        if(visitTime == null){
            response.setStatus(500);
            return;
        }
        response.setStatus(200);
        LOG.info("Visit time: " + visitTime);
        response.setHeader(SecurityConstants.JWT_HEADER, JWTToken.generate("username", SecurityConstants.CUSTOMER));
    }


}
