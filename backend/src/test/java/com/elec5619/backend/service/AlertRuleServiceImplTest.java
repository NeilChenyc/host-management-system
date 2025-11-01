package com.elec5619.backend.service;

import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.repository.AlertEventRepository;
import com.elec5619.backend.repository.AlertRuleRepository;
import com.elec5619.backend.service.impl.AlertRuleServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlertRuleServiceImplTest {

    @Mock private AlertRuleRepository alertRuleRepository;
    @Mock private AlertEventRepository alertEventRepository;
    @InjectMocks private AlertRuleServiceImpl service;

    private AlertRule rule;

    @BeforeEach
    void setup() {
        rule = new AlertRule();
        rule.setRuleId(1L);
        rule.setRuleName("cpu_high");
        rule.setEnabled(true);
        rule.setSeverity("high");
        rule.setServerId(10L);
    }

    @Test
    void createAlertRule_success() {
        when(alertRuleRepository.save(any(AlertRule.class))).thenAnswer(inv -> inv.getArgument(0));
        AlertRule created = service.createAlertRule(rule);
        assertNull(created.getRuleId());
        verify(alertRuleRepository).save(any(AlertRule.class));
    }

    @Test
    void batchCreate_success() {
        List<AlertRule> list = new ArrayList<>();
        AlertRule a = new AlertRule(); a.setRuleName("a");
        AlertRule b = new AlertRule(); b.setRuleName("b");
        list.add(a); list.add(b);

        when(alertRuleRepository.save(any(AlertRule.class))).thenAnswer(inv -> inv.getArgument(0));

        List<AlertRule> created = service.createAlertRulesBatch(list);
        assertEquals(2, created.size());
        verify(alertRuleRepository, times(2)).save(any(AlertRule.class));
    }

    @Test
    void update_success_and_notFound() {
        when(alertRuleRepository.findById(1L)).thenReturn(Optional.of(rule));
        when(alertRuleRepository.save(any(AlertRule.class))).thenAnswer(inv -> inv.getArgument(0));

        AlertRule input = new AlertRule();
        input.setRuleName("cpu_medium");
        input.setSeverity("medium");
        input.setEnabled(false);
        input.setServerId(11L);
        AlertRule saved = service.updateAlertRule(1L, input);
        assertEquals("cpu_medium", saved.getRuleName());
        assertEquals("medium", saved.getSeverity());
        assertEquals(false, saved.getEnabled());

        when(alertRuleRepository.findById(2L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> service.updateAlertRule(2L, input));
    }

    @Test
    void delete_cascadesEvents_thenDeletesRule() {
        when(alertRuleRepository.findById(1L)).thenReturn(Optional.of(rule));
        doNothing().when(alertEventRepository).deleteByAlertRuleRuleId(1L);
        doNothing().when(alertRuleRepository).delete(rule);
        service.deleteAlertRule(1L);
        verify(alertEventRepository).deleteByAlertRuleRuleId(1L);
        verify(alertRuleRepository).delete(rule);
    }

    @Test
    void toggleStatus_ok_and_notFound() {
        when(alertRuleRepository.findById(1L)).thenReturn(Optional.of(rule));
        when(alertRuleRepository.save(any(AlertRule.class))).thenAnswer(inv -> inv.getArgument(0));
        AlertRule toggled = service.toggleAlertRuleStatus(1L, false);
        assertFalse(toggled.getEnabled());

        when(alertRuleRepository.findById(9L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> service.toggleAlertRuleStatus(9L, true));
    }

    @Test
    void simpleDelegations() {
        service.getAllAlertRules();
        verify(alertRuleRepository).findAll();

        service.getAlertRuleById(1L);
        verify(alertRuleRepository).findById(1L);

        service.getAlertRulesByEnabled(true);
        verify(alertRuleRepository).findByEnabled(true);

        service.getAlertRulesBySeverity("high");
        verify(alertRuleRepository).findBySeverity("high");

        service.getAlertRulesByServerId(10L);
        verify(alertRuleRepository).findByServerId(10L);
    }
}


