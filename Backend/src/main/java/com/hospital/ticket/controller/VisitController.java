package com.hospital.ticket.controller;

import com.hospital.ticket.model.Visit;
import com.hospital.ticket.repository.VisitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class VisitController {
    @Autowired
    private VisitRepository visitRepository;

    @GetMapping("/visits")
    public @ResponseBody List<Visit> getVisits(){
        return (List<Visit>)visitRepository.findAll();
    }

    @GetMapping("/{id}/visits")
    public @ResponseBody List<Visit> getSpecialistVisits(@PathVariable("id") int id){
        return visitRepository.findBySpecialistId(id);
    }
}
