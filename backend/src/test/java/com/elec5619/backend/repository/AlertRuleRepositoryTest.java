package com.elec5619.backend.repository;

import com.elec5619.backend.entity.AlertRule;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class AlertRuleRepositoryTest {
    @Autowired AlertRuleRepository alertRuleRepository;

    @Test
    void saveAndQueryByFields() {
        AlertRule r = new AlertRule();
        r.setRuleName("cpu");
        r.setTargetMetric("cpu_usage");
        r.setComparator(">");
        r.setThreshold(80.0);
        r.setDuration(1);
        r.setSeverity("HIGH");
        r.setEnabled(true);
        r.setServerId(1L);
        alertRuleRepository.save(r);
        assertTrue(alertRuleRepository.existsByRuleName("cpu"));
        List<AlertRule> high = alertRuleRepository.findBySeverity("HIGH");
        assertFalse(high.isEmpty());
        List<AlertRule> enabled = alertRuleRepository.findByEnabled(true);
        assertFalse(enabled.isEmpty());
        List<AlertRule> byServer = alertRuleRepository.findByServerId(1L);
        assertFalse(byServer.isEmpty());
    }
}
