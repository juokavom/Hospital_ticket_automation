package com.hospital.ticket.repository;

import com.hospital.ticket.model.Visit;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public interface VisitRepository extends CrudRepository<Visit, Long> {
    @Query(value = "SELECT time FROM visit WHERE fk_specialist = ?1 AND (status = 'DUE' OR  status = 'STARTED') ORDER BY time DESC LIMIT 1", nativeQuery = true)
    String findLastActiveVisitTime(Long specialistId);
}
