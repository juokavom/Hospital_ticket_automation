package com.hospital.ticket.model;

import java.util.List;

public class DueAndStartedVisits {
    private List<Visit> dueVisits;
    private List<Visit> startedVisits;

    public DueAndStartedVisits(List<Visit> dueVisits, List<Visit> startedVisits) {
        this.dueVisits = dueVisits;
        this.startedVisits = startedVisits;
    }

    public List<Visit> getDueVisits() {
        return dueVisits;
    }

    public void setDueVisits(List<Visit> dueVisits) {
        this.dueVisits = dueVisits;
    }

    public List<Visit> getStartedVisits() {
        return startedVisits;
    }

    public void setStartedVisits(List<Visit> startedVisits) {
        this.startedVisits = startedVisits;
    }
}
