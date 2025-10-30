package com.elec5619.backend.repository;

import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.entity.AlertRule;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import java.time.LocalDateTime;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class AlertEventRepositoryTest {
    @Autowired AlertEventRepository alertEventRepository;
    @Autowired AlertRuleRepository alertRuleRepository;

    @Test
    void saveAndQueryByServerAndStatusAndTime() {
        // Persist minimal valid rule
        AlertRule r = new AlertRule();
        r.setRuleName("cpu");
        r.setTargetMetric("cpu_usage");
        r.setComparator(">");
        r.setThreshold(0.8);
        r.setDuration(1);
        r.setSeverity("HIGH");
        r.setEnabled(true);
        r = alertRuleRepository.save(r);

        AlertEvent e = new AlertEvent();
        e.setAlertRule(r);
        e.setServerId(10L);
        e.setStatus("firing");
        e.setStartedAt(LocalDateTime.now().minusMinutes(5));
        alertEventRepository.save(e);
        assertFalse(alertEventRepository.findByServerId(10L).isEmpty());
        assertFalse(alertEventRepository.findByStatus("firing").isEmpty());
        List<AlertEvent> list = alertEventRepository.findByStartedAtBetween(LocalDateTime.now().minusHours(1), LocalDateTime.now());
        assertFalse(list.isEmpty());
    }
}
