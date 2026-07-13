package org.example.stallrental.repository;

import org.example.stallrental.model.entity.Booking;
import org.example.stallrental.model.enumType.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerId(Long customerId);
    List<Booking> findByBoothId(Long boothId);

    @Query("SELECT b FROM Booking b WHERE b.booth.id = :boothId " +
           "AND b.status <> :cancelledStatus " +
           "AND b.startDate <= :endDate AND b.endDate >= :startDate")
    List<Booking> findOverlappingBookings(
            @Param("boothId") Long boothId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("cancelledStatus") BookingStatus cancelledStatus
    );
}
