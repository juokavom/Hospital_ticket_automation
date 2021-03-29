package com.hospital.ticket.controller;

import com.hospital.ticket.constants.SecurityConstants;
import com.hospital.ticket.model.Specialist;
import com.hospital.ticket.model.Visit;
import com.hospital.ticket.repository.VisitRepository;
import com.hospital.ticket.utils.JWTToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Optional;

@RestController
public class VisitController {
    @Autowired
    private VisitRepository visitRepository;

}
