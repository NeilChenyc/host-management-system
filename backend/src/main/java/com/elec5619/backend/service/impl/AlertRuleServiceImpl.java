package com.elec5619.backend.service.impl;

import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.repository.AlertRuleRepository;
import com.elec5619.backend.repository.AlertEventRepository;
import com.elec5619.backend.service.AlertRuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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
    @Transactional
    public List<AlertRule> createAlertRulesBatch(List<AlertRule> alertRules) {
        List<AlertRule> createdRules = new ArrayList<>();
        
        for (AlertRule alertRule : alertRules) {
            // 清除ID以确保创建新记录
            alertRule.setRuleId(null);
            
            // 保存规则 - 移除全局名称唯一性检查，允许同一规则名称在不同服务器上存在
            AlertRule createdRule = alertRuleRepository.save(alertRule);
            createdRules.add(createdRule);
        }
        
        return createdRules;
    }

    @Override
    public AlertRule createAlertRule(AlertRule alertRule) {
        alertRule.setRuleId(null);
        // 移除全局名称唯一性检查，允许同一规则名称在不同服务器上存在
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
        existingRule.setServerId(alertRule.getServerId());
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
    @Transactional
    public void deleteAlertRulesBatch(List<Long> ruleIds) {
        for (Long ruleId : ruleIds) {
            try {
                deleteAlertRule(ruleId);
            } catch (IllegalArgumentException e) {
                // Log the error but continue with other deletions
                System.err.println("Failed to delete alert rule with ID " + ruleId + ": " + e.getMessage());
            }
        }
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
    public List<AlertRule> getAlertRulesByServerId(Long serverId) {
        return alertRuleRepository.findByServerId(serverId);
    }
}
