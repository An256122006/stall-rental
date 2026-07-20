package org.example.stallrental.repository;

import org.example.stallrental.model.entity.CallSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CallSessionRepository extends JpaRepository<CallSession, Long> {
    
    @Query("SELECT c FROM CallSession c WHERE (c.caller.id = :userId OR c.receiver.id = :userId) AND c.status IN ('RINGING', 'CONNECTED')")
    List<CallSession> findActiveCallsForUser(@Param("userId") Long userId);
}
