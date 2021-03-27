package com.hospital.ticket.controller;

import com.hospital.ticket.model.Specialist;
import com.hospital.ticket.model.Visit;
import com.hospital.ticket.repository.SpecialistRepository;
import com.hospital.ticket.repository.VisitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
public class SpecialistController {
    @Autowired
    private SpecialistRepository specialistRepository;

    @Autowired
    private VisitRepository visitRepository;

    @GetMapping("spec/{id}/visits")
    public @ResponseBody
    List<Visit> getSpecialistVisits(@PathVariable("id") int id) {
        return visitRepository.findBySpecialistId(id);
    }

    @GetMapping("spec/test/{title}")
    public @ResponseBody
    List<Specialist> getSpecialists(@PathVariable("title") String title) {
        return specialistRepository.findByTitle(title);
    }

    @RequestMapping("/login")
    public Specialist getSpecialistDetailsAfterLogin(Principal specialist) {
        List<Specialist> specialists = specialistRepository.findByTitle(specialist.getName());
        if (specialists.size() > 0) {
            return specialists.get(0);
        }else {
            return null;
        }

    }


}
