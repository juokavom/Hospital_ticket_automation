package com.hospital.ticket.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="specialist")
public class Specialist implements Comparable{
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String title;
    @Column(name = "visit_minutes")
    private int timeForVisit;
    @JsonIgnore
    private String password;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public int getTimeForVisit() {
        return timeForVisit;
    }

    public void setTimeForVisit(int timeForVisit) {
        this.timeForVisit = timeForVisit;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public int compareTo(Object o) {
        return title.compareTo(((Specialist) o).title);
    }
}
