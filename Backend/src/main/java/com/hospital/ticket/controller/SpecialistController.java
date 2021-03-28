package com.hospital.ticket.controller;

import com.hospital.ticket.model.Specialist;
import com.hospital.ticket.model.Visit;
import com.hospital.ticket.repository.SpecialistRepository;
import com.hospital.ticket.repository.VisitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@RestController
public class SpecialistController {
    @Autowired
    private SpecialistRepository specialistRepository;

    @Autowired
    private VisitRepository visitRepository;

    @GetMapping("/specialists")
    public @ResponseBody
    List<String> getSpecialists() {
        List<Specialist> specialists = (List<Specialist>) specialistRepository.findAll();
        List<String> titles = new ArrayList<>();
        specialists.forEach(spec -> {
            titles.add(spec.getTitle());
        });
        Collections.sort(titles);
        return titles;
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


}
