package com.hospital.ticket.repository;

import com.hospital.ticket.model.Visit;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public interface VisitRepository extends CrudRepository<Visit, Long> {
    ArrayList<Visit> findBySpecialistId(Long specialistId);
}
