package com.hospital.ticket.repository;

import com.hospital.ticket.model.Visit;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitRepository extends CrudRepository<Visit, Long> {
    @Query(value = "SELECT time FROM visit WHERE fk_specialist = ?1 AND (status = 'DUE' OR  status = 'STARTED') ORDER BY id DESC LIMIT 1", nativeQuery = true)
    String findLastActiveVisitTime(Long specialistId);

    @Query(value = "SELECT * FROM visit WHERE fk_specialist = ?1 AND (status = 'DUE' OR  status = 'STARTED') AND id <= ?2 ORDER BY id ASC", nativeQuery = true)
    List<Visit> findActiveVisitsBefore(Long specialistId, Long visitId);

    @Query(value = "SELECT * FROM visit WHERE fk_specialist = ?1 AND (status = 'DUE' OR  status = 'STARTED') AND id > ?2 ORDER BY id ASC", nativeQuery = true)
    List<Visit> findActiveVisitsAffectedByCancellation(Long specialistId, Long cancelledVisitId);

    @Query(value = "SELECT * FROM visit WHERE fk_specialist = ?1 AND (status = 'DUE' OR  status = 'STARTED') ORDER BY id ASC", nativeQuery = true)
    List<Visit> findAllActiveSpecialistVisits(Long specialistId);

    @Query(value = "SELECT * FROM visit WHERE (status = 'DUE' OR  status = 'STARTED') ORDER BY id ASC", nativeQuery = true)
    List<Visit> findAllActiveVisits();
}
