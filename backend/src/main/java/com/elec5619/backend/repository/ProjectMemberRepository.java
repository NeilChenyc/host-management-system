package com.elec5619.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.elec5619.backend.entity.Project;
import com.elec5619.backend.entity.ProjectMember;
import com.elec5619.backend.entity.User;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    
    // 根据项目查找所有成员
    List<ProjectMember> findByProject(Project project);
    
    // 根据用户查找参与的所有项目
    List<ProjectMember> findByUser(User user);
    
    // 根据项目ID查找所有成员
    List<ProjectMember> findByProjectId(Long projectId);
    
    // 根据用户ID查找参与的所有项目
    List<ProjectMember> findByUserId(Long userId);
    
    // 检查用户是否已经是项目成员
    Optional<ProjectMember> findByProjectAndUser(Project project, User user);
    
    // 检查用户是否已经是项目成员（通过ID）
    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);
    
    // 删除项目的所有成员
    @Modifying
    @Transactional
    @Query("DELETE FROM ProjectMember pm WHERE pm.project = :project")
    void deleteByProject(@Param("project") Project project);
    
    // 删除用户的所有项目关联
    @Modifying
    @Transactional
    @Query("DELETE FROM ProjectMember pm WHERE pm.user = :user")
    void deleteByUser(@Param("user") User user);
}
