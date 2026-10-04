package com.example.eventbooking.service;

import com.example.eventbooking.exception.ConflictException;
import com.example.eventbooking.model.EventModel;
import com.example.eventbooking.model.UserModel;
import com.example.eventbooking.repository.BookingRepository;
import com.example.eventbooking.repository.EventRepository;
import com.example.eventbooking.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.assertj.core.api.Assertions.assertThat;

// No @Transactional here on purpose: each booking must really commit,
// otherwise the optimistic lock never gets a chance to fire.
@SpringBootTest
class BookingConcurrencyTest {

    private static final int USERS = 10;

    @Autowired BookingService bookingService;
    @Autowired UserRepository userRepository;
    @Autowired EventRepository eventRepository;
    @Autowired BookingRepository bookingRepository;

    @Test
    void lastTicketCanOnlyBeBookedOnce() throws Exception {
        // 1 ticket left, 10 different users want it
        // Own admin, so the test doesn't depend on AdminSeeder's email
        // (ADMIN_EMAIL in your shell would override the one in test properties)
        UserModel admin = userRepository.save(UserModel.builder()
                .name("Test Admin").email("concurrency-admin@test.com").password("x")
                .role(UserModel.Role.ADMIN)
                .build());
        EventModel event = eventRepository.save(EventModel.builder()
                .title("Last ticket show")
                .location("Pune")
                .eventDate(LocalDateTime.now().plusDays(7))
                .totalTickets(1)
                .price(BigDecimal.TEN)
                .createdBy(admin)
                .build());

        List<String> emails = new ArrayList<>();
        for (int i = 0; i < USERS; i++) {
            String email = "user" + i + "@test.com";
            userRepository.save(UserModel.builder()
                    .name("User " + i).email(email).password("x").role(UserModel.Role.USER)
                    .build());
            emails.add(email);
        }

        // All threads wait at the gate, then try to book at the same moment
        CountDownLatch gate = new CountDownLatch(1);
        List<Future<Boolean>> results = new ArrayList<>();
        try (ExecutorService pool = Executors.newFixedThreadPool(USERS)) {
            for (String email : emails) {
                results.add(pool.submit(() -> {
                    gate.await();
                    try {
                        bookingService.book(event.getId(), email);
                        return true;
                    } catch (ConflictException | ObjectOptimisticLockingFailureException e) {
                        return false; // sold out, or lost the race → API would return 409
                    }
                }));
            }
            gate.countDown();
        }

        long successes = 0;
        for (Future<Boolean> r : results) {
            if (r.get()) successes++;
        }

        assertThat(successes).isEqualTo(1);
        assertThat(bookingRepository.count()).isEqualTo(1);
        assertThat(eventRepository.findById(event.getId()).orElseThrow().getBookedTickets()).isEqualTo(1);
    }
}
