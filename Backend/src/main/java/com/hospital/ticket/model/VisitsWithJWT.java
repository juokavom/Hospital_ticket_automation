package com.hospital.ticket.model;
import java.util.List;

public class VisitsWithJWT {
    private String token;
    private List<Visit> allVisits;

    public VisitsWithJWT(String token, List<Visit> allVisits) {
        this.token = token;
        this.allVisits = allVisits;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public List<Visit> getAllVisits() {
        return allVisits;
    }

    public void setAllVisits(List<Visit> allVisits) {
        this.allVisits = allVisits;
    }
}
