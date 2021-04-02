package com.hospital.ticket.model;

public class SpecialistWithJWT {
    private String token;
    private Specialist specialist;

    public SpecialistWithJWT(String token, Specialist specialist) {
        this.token = token;
        this.specialist = specialist;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Specialist getSpecialist() {
        return specialist;
    }

    public void setSpecialist(Specialist specialist) {
        this.specialist = specialist;
    }
}
