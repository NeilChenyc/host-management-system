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
        // Prepare a valid alert rule
        AlertRule rule = new AlertRule();
        rule.setRuleName("cpu");
        rule.setTargetMetric("cpu_usage");
        rule.setComparator(">");
        rule.setThreshold(0.8);
        rule.setDuration(1);
        rule.setSeverity("HIGH");
        rule.setEnabled(true);
        rule.setServerId(10L);
        rule = alertRuleRepository.save(rule);

        AlertEvent e = new AlertEvent();
        e.setAlertRule(rule);
        e.setServerId(10L);
        e.setStatus("firing");
        e.setStartedAt(LocalDateTime.now().minusMinutes(5));
        alertEventRepository.save(e);
        assertFalse(alertEventRepository.findByServerId(10L).isEmpty());
        assertFalse(alertEventRepository.findByStatus("firing").isEmpty());
        var list = alertEventRepository.findByStartedAtBetween(LocalDateTime.now().minusHours(1), LocalDateTime.now());
        assertFalse(list.isEmpty());
    }
}
