package com.hospital.ticket.repository;

import com.hospital.ticket.model.Specialist;
import com.hospital.ticket.model.Visit;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpecialistRepository extends CrudRepository<Specialist, Long> {
    List<Specialist> findByTitle(String title);

}
