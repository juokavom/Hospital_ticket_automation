package com.hospital.ticket.model;

import com.hospital.ticket.constants.VisitStatus;

import javax.persistence.*;

@Entity
@Table(name = "visit")
public class Visit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String code;
    private String time;
    @Enumerated(EnumType.STRING)
    private VisitStatus status;
    @ManyToOne
    @JoinColumn(name = "fk_specialist")
    private Specialist specialist;

    public Visit() {
    }

    public Visit(String time, Specialist specialist) {
        setId(null);
        setCode(specialist.getTitle().substring(0, 4) + "-");
        setTime(time);
        setStatus(VisitStatus.DUE);
        setSpecialist(specialist);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public VisitStatus getStatus() {
        return status;
    }

    public void setStatus(VisitStatus status) {
        this.status = status;
    }

    public Specialist getSpecialist() {
        return specialist;
    }

    public void setSpecialist(Specialist specialist) {
        this.specialist = specialist;
    }

    @Override
    public String toString() {
        return "Visit{" +
                "id=" + id +
                ", code='" + code + '\'' +
                ", time='" + time + '\'' +
                ", status=" + status +
                ", specialist=" + specialist +
                '}';
    }
}
