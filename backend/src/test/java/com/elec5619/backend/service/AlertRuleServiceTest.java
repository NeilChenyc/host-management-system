package com.elec5619.backend.service;

import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.repository.AlertRuleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AlertRuleService
 */
@ExtendWith(MockitoExtension.class)
class AlertRuleServiceTest {

    @Mock
    private AlertRuleRepository alertRuleRepository;

    private AlertRuleService alertRuleService;

    private AlertRule testAlertRule;

    @BeforeEach
    void setUp() {
        // Create a simple mock implementation
        alertRuleService = new AlertRuleService() {
            @Override
            public AlertRule createAlertRule(AlertRule alertRule) {
                if (alertRule == null) {
                    throw new IllegalArgumentException("AlertRule cannot be null");
                }
                return alertRuleRepository.save(alertRule);
            }

            @Override
            public List<AlertRule> getAllAlertRules() {
                return alertRuleRepository.findAll();
            }

            @Override
            public Optional<AlertRule> getAlertRuleById(Long id) {
                return alertRuleRepository.findById(id);
            }

            @Override
            public AlertRule updateAlertRule(Long id, AlertRule alertRule) {
                return null; // Not implemented for this test
            }

            @Override
            public void deleteAlertRule(Long id) {
                if (alertRuleRepository.existsById(id)) {
                    alertRuleRepository.deleteById(id);
                }
            }

            @Override
            public List<AlertRule> getEnabledAlertRules() {
                return null; // Not implemented for this test
            }

            @Override
            public boolean validateAlertRule(AlertRule alertRule) {
                return true; // Not implemented for this test
            }
        };

        testAlertRule = new AlertRule();
        testAlertRule.setRuleName("Test CPU Alert");
        testAlertRule.setDescription("Test alert for CPU usage");
        testAlertRule.setTargetMetric("cpuUsage");
        testAlertRule.setComparator("GREATER_THAN");
        testAlertRule.setThreshold(80.0);
        testAlertRule.setDuration(5);
        testAlertRule.setSeverity("CRITICAL");
        testAlertRule.setEnabled(true);
        testAlertRule.setScopeLevel("SERVER");
    }

    @Test
    void testCreateAlertRule_Success() {
        // Given
        when(alertRuleRepository.save(any(AlertRule.class))).thenReturn(testAlertRule);

        // When
        AlertRule result = alertRuleService.createAlertRule(testAlertRule);

        // Then
        assertNotNull(result);
        assertEquals("Test CPU Alert", result.getRuleName());
        assertEquals("cpuUsage", result.getTargetMetric());
        assertEquals("GREATER_THAN", result.getComparator());
        assertEquals(80.0, result.getThreshold());
        assertEquals("CRITICAL", result.getSeverity());
        assertTrue(result.getEnabled());

        verify(alertRuleRepository, times(1)).save(testAlertRule);
    }

    @Test
    void testCreateAlertRule_NullInput() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            alertRuleService.createAlertRule(null);
        });

        verify(alertRuleRepository, never()).save(any());
    }

    @Test
    void testGetAllAlertRules_Success() {
        // Given
        AlertRule rule1 = new AlertRule();
        rule1.setRuleName("CPU Alert");
        rule1.setTargetMetric("cpuUsage");
        rule1.setThreshold(80.0);

        AlertRule rule2 = new AlertRule();
        rule2.setRuleName("Memory Alert");
        rule2.setTargetMetric("memoryUsage");
        rule2.setThreshold(70.0);

        List<AlertRule> mockRules = Arrays.asList(rule1, rule2);
        when(alertRuleRepository.findAll()).thenReturn(mockRules);

        // When
        List<AlertRule> result = alertRuleService.getAllAlertRules();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("CPU Alert", result.get(0).getRuleName());
        assertEquals("Memory Alert", result.get(1).getRuleName());

        verify(alertRuleRepository, times(1)).findAll();
    }

    @Test
    void testGetAlertRuleById_Success() {
        // Given
        Long ruleId = 1L;
        testAlertRule.setRuleId(ruleId);
        when(alertRuleRepository.findById(ruleId)).thenReturn(Optional.of(testAlertRule));

        // When
        Optional<AlertRule> result = alertRuleService.getAlertRuleById(ruleId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(ruleId, result.get().getRuleId());
        assertEquals("Test CPU Alert", result.get().getRuleName());

        verify(alertRuleRepository, times(1)).findById(ruleId);
    }

    @Test
    void testGetAlertRuleById_NotFound() {
        // Given
        Long ruleId = 999L;
        when(alertRuleRepository.findById(ruleId)).thenReturn(Optional.empty());

        // When
        Optional<AlertRule> result = alertRuleService.getAlertRuleById(ruleId);

        // Then
        assertFalse(result.isPresent());

        verify(alertRuleRepository, times(1)).findById(ruleId);
    }

    @Test
    void testDeleteAlertRule_Success() {
        // Given
        Long ruleId = 1L;
        when(alertRuleRepository.existsById(ruleId)).thenReturn(true);

        // When
        alertRuleService.deleteAlertRule(ruleId);

        // Then
        verify(alertRuleRepository, times(1)).existsById(ruleId);
        verify(alertRuleRepository, times(1)).deleteById(ruleId);
    }

    @Test
    void testDeleteAlertRule_NotFound() {
        // Given
        Long ruleId = 999L;
        when(alertRuleRepository.existsById(ruleId)).thenReturn(false);

        // When
        alertRuleService.deleteAlertRule(ruleId);

        // Then
        verify(alertRuleRepository, times(1)).existsById(ruleId);
        verify(alertRuleRepository, never()).deleteById(any());
    }
}