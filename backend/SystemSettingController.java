package com.elec5619.backend.controller;

import com.elec5619.backend.entity.SystemSetting;
import com.elec5619.backend.repository.SystemSettingRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@Tag(name = "System Settings", description = "Manage system key-value settings")
public class SystemSettingController {

    private final SystemSettingRepository repo;
    private final DataSource dataSource;

    public SystemSettingController(SystemSettingRepository repo, DataSource dataSource) {
        this.repo = repo;
        this.dataSource = dataSource;
    }

    // --- DB 健康检查 ---
    @Operation(summary = "Database health check")
    @GetMapping("/_dbping")
    public ResponseEntity<Map<String, Object>> dbPing() {
        try (var c = dataSource.getConnection();
             var st = c.createStatement();
             var rs = st.executeQuery("select 1")) {
            rs.next();
            return ResponseEntity.ok(Map.of("ok", true, "v", rs.getInt(1)));
        } catch (Exception e) {
            var causes = new ArrayList<String>();
            for (Throwable t = e; t != null; t = t.getCause()) {
                causes.add(t.getClass().getName() + ": " + String.valueOf(t.getMessage()));
            }
            return ResponseEntity.internalServerError().body(Map.of("ok", false, "causes", causes));
        }
    }

    // --- 设置列表 ---
    @Operation(summary = "List all settings")
    @GetMapping
    public List<SystemSetting> list() {
        return repo.findAll();
    }

    // --- 按 key 获取 ---
    @Operation(summary = "Get a setting by key")
    @GetMapping("/{key}")
    public ResponseEntity<SystemSetting> get(@PathVariable String key) {
        return repo.findByKeyName(key)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --- 创建/更新 请求体（不用 record，避免低语言级别报红）---
    public static class UpsertReq {
        @NotBlank
        private String keyName;
        @NotBlank
        private String value;

        public UpsertReq() {}
        public String getKeyName() { return keyName; }
        public void setKeyName(String keyName) { this.keyName = keyName; }
        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
    }

    // --- 创建或更新 ---
    @Operation(summary = "Create or update (upsert) a setting")
    @PostMapping
    public ResponseEntity<SystemSetting> upsert(@Valid @RequestBody UpsertReq req) {
        SystemSetting setting = repo.findByKeyName(req.getKeyName())
                .map(existing -> {
                    existing.setValue(req.getValue());
                    return existing;
                })
                .orElseGet(() -> {
                    SystemSetting s = new SystemSetting();
                    s.setKeyName(req.getKeyName());
                    s.setValue(req.getValue());
                    return s;
                });
        return ResponseEntity.ok(repo.save(setting));
    }

    // --- 删除 ---
    @Operation(summary = "Delete a setting by key")
    @DeleteMapping("/{key}")
public ResponseEntity<?> delete(@PathVariable String key) {
    return repo.findByKeyName(key)
            .map(s -> {
                repo.delete(s);
                return ResponseEntity.noContent().build();
            })
            .orElse(ResponseEntity.notFound().build());
}

}
