package com.hospital.ticket.controller;

import com.hospital.ticket.constants.SecretConstants;
import com.hospital.ticket.constants.SecurityConstants;
import com.hospital.ticket.model.Specialist;
import com.hospital.ticket.utils.JWTToken;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.crypto.SecretKey;
import javax.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.Date;
import java.util.List;

@RestController
public class CustomerController {


}
