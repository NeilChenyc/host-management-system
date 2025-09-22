package com.elec5619.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.elec5619.backend.entity.Project;
import com.elec5619.backend.entity.ProjectStatus;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByProjectName(String projectName);
    List<Project> findByStatus(ProjectStatus status);
}


