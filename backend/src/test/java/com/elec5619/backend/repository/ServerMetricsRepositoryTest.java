package com.elec5619.backend.repository;

import com.elec5619.backend.entity.ServerMetrics;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ServerMetricsRepositoryTest {
    @Autowired ServerMetricsRepository serverMetricsRepository;

    @Test
    void saveAndFindLatest() {
        ServerMetrics m = new ServerMetrics();
        m.setServerId(5L);
        m.setCollectedAt(LocalDateTime.now());
        serverMetricsRepository.save(m);
        ServerMetrics latest = serverMetricsRepository.findTopByServerIdOrderByCollectedAtDesc(5L);
        assertNotNull(latest);
        assertEquals(5L, latest.getServerId());
    }
}
