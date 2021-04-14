package com.hospital.ticket.model;

import java.util.List;

public class CancelledVisit {
    private String visitId;
    private List<Visit> affectedVisits;

    public CancelledVisit(String visitId, List<Visit> affectedVisits) {
        this.visitId = visitId;
        this.affectedVisits = affectedVisits;
    }

    public String getVisit() {
        return visitId;
    }

    public void setVisit(String visitId) {
        this.visitId = visitId;
    }

    public List<Visit> getAffectedVisits() {
        return affectedVisits;
    }

    public void setAffectedVisits(List<Visit> affectedVisits) {
        this.affectedVisits = affectedVisits;
    }
}
