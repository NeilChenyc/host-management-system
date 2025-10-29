package com.elec5619.backend.service.impl;

import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.repository.AlertRuleRepository;
import com.elec5619.backend.repository.AlertEventRepository;
import com.elec5619.backend.service.AlertRuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Implementation of AlertRuleService interface.
 */
@Service
public class AlertRuleServiceImpl implements AlertRuleService {

    private final AlertRuleRepository alertRuleRepository;
    private final AlertEventRepository alertEventRepository;

    @Autowired
    public AlertRuleServiceImpl(AlertRuleRepository alertRuleRepository, AlertEventRepository alertEventRepository) {
        this.alertRuleRepository = alertRuleRepository;
        this.alertEventRepository = alertEventRepository;
    }

    @Override
    public AlertRule createAlertRule(AlertRule alertRule) {
        alertRule.setRuleId(null);
        if (alertRuleRepository.existsByRuleName(alertRule.getRuleName())) {
            throw new IllegalArgumentException("Alert rule with name '" + alertRule.getRuleName() + "' already exists");
        }
        return alertRuleRepository.save(alertRule);
    }

    @Override
    public List<AlertRule> getAllAlertRules() {
        return alertRuleRepository.findAll();
    }

    @Override
    public Optional<AlertRule> getAlertRuleById(Long ruleId) {
        return alertRuleRepository.findById(ruleId);
    }

    @Override
    public AlertRule updateAlertRule(Long ruleId, AlertRule alertRule) {
        AlertRule existingRule = alertRuleRepository.findById(ruleId)
                .orElseThrow(() -> new IllegalArgumentException("Alert rule with ID " + ruleId + " not found"));

        existingRule.setRuleName(alertRule.getRuleName());
        existingRule.setDescription(alertRule.getDescription());
        existingRule.setTargetMetric(alertRule.getTargetMetric());
        existingRule.setComparator(alertRule.getComparator());
        existingRule.setThreshold(alertRule.getThreshold());
        existingRule.setDuration(alertRule.getDuration());
        existingRule.setSeverity(alertRule.getSeverity());
        existingRule.setEnabled(alertRule.getEnabled());
        existingRule.setScopeLevel(alertRule.getScopeLevel());
        existingRule.setProjectId(alertRule.getProjectId());
        existingRule.setTargetFilter(alertRule.getTargetFilter());

        return alertRuleRepository.save(existingRule);
    }

    @Override
    @Transactional
    public void deleteAlertRule(Long ruleId) {
        AlertRule existingRule = alertRuleRepository.findById(ruleId)
                .orElseThrow(() -> new IllegalArgumentException("Alert rule with ID " + ruleId + " not found"));
        
        // First delete all related alert events
        alertEventRepository.deleteByAlertRuleRuleId(ruleId);
        
        // Then delete the alert rule
        alertRuleRepository.delete(existingRule);
    }

    @Override
    public List<AlertRule> getAlertRulesByEnabled(Boolean enabled) {
        return alertRuleRepository.findByEnabled(enabled);
    }

    @Override
    public List<AlertRule> getAlertRulesBySeverity(String severity) {
        return alertRuleRepository.findBySeverity(severity);
    }

    @Override
    public AlertRule toggleAlertRuleStatus(Long ruleId, Boolean enabled) {
        AlertRule existingRule = alertRuleRepository.findById(ruleId)
                .orElseThrow(() -> new IllegalArgumentException("Alert rule with ID " + ruleId + " not found"));
        existingRule.setEnabled(enabled);
        return alertRuleRepository.save(existingRule);
    }

    @Override
    public List<AlertRule> getAlertRulesByProjectId(Long projectId) {
        return alertRuleRepository.findByProjectId(projectId);
    }
}
