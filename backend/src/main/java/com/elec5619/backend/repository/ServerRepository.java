package com.elec5619.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.elec5619.backend.entity.Server;
import com.elec5619.backend.entity.ServerStatus;

public interface ServerRepository extends JpaRepository<Server, Long> {
    Optional<Server> findByServerName(String serverName);
    List<Server> findByStatus(ServerStatus status);
}


