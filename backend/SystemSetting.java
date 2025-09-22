package com.elec5619.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "system_settings")
public class SystemSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String keyName;

    @Column(nullable = false)
    private String value;

    // ---- 构造方法 ----
    public SystemSetting() {
    }

    public SystemSetting(Long id, String keyName, String value) {
        this.id = id;
        this.keyName = keyName;
        this.value = value;
    }

    // ---- Getter 和 Setter ----
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getKeyName() {
        return keyName;
    }

    public void setKeyName(String keyName) {
        this.keyName = keyName;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    // ---- 可选：方便调试 ----
    @Override
    public String toString() {
        return "SystemSetting{" +
                "id=" + id +
                ", keyName='" + keyName + '\'' +
                ", value='" + value + '\'' +
                '}';
    }
}
