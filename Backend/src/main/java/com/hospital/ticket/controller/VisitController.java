package com.hospital.ticket.controller;

import com.hospital.ticket.model.Visit;
import com.hospital.ticket.repository.VisitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("visit")
public class VisitController {
    @Autowired
    private VisitRepository visitRepository;

    @GetMapping("/all")
    public @ResponseBody List<Visit> getVisits(){
        return (List<Visit>)visitRepository.findAll();
    }

    @GetMapping("/{id}")
    public @ResponseBody Optional<Visit> getVisit(@PathVariable("id") Long id){
        return visitRepository.findById(id);

    }
}
