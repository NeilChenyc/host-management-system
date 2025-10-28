package com.elec5619.backend.repository;

import com.elec5619.backend.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {
    Optional<SystemSetting> findByKeyName(String keyName);
    boolean existsByKeyName(String keyName);
    void deleteByKeyName(String keyName);
}
