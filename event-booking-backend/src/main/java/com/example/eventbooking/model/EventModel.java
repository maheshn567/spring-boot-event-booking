package com.example.eventbooking.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventModel {

    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank
    @Column(nullable = false)
    private String location;

    @NotNull
    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;

    @Min(1)
    @Column(name = "total_tickets", nullable = false)
    private int totalTickets;

    @Builder.Default
    @Column(name = "booked_tickets", nullable = false)
    private int bookedTickets = 0;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    // The ADMIN user who created this event
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private UserModel createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ── Optimistic Locking ────────────────────────────────────────
    // Two requests read the event with version=N and both increment
    // bookedTickets. The first commit bumps version to N+1; the second
    // UPDATE ... WHERE version=N matches 0 rows → OptimisticLockException.
    @Version
    private Long version;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Helper: how many tickets are still available
    public int getAvailableTickets() {
        return totalTickets - bookedTickets;
    }
}
