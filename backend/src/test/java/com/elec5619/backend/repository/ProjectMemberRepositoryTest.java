package com.elec5619.backend.repository;

import com.elec5619.backend.entity.Project;
import com.elec5619.backend.entity.ProjectMember;
import com.elec5619.backend.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ProjectMemberRepositoryTest {
    @Autowired ProjectRepository projectRepository;
    @Autowired UserRepository userRepository;
    @Autowired ProjectMemberRepository projectMemberRepository;

    @Test
    void saveAndQueryByUserAndProject() {
        Project p = new Project(); p.setProjectName("prj"); p = projectRepository.save(p);
        User u = new User(); u.setUsername("userx"); u.setEmail("e@test"); u.setPasswordHash("p"); u.setRole("operation"); u = userRepository.save(u);
        ProjectMember pm = new ProjectMember(p, u);
        projectMemberRepository.save(pm);

        List<ProjectMember> byUser = projectMemberRepository.findByUserId(u.getId());
        assertFalse(byUser.isEmpty());
        assertTrue(projectMemberRepository.findByProjectIdAndUserId(p.getId(), u.getId()).isPresent());
        List<ProjectMember> byProject = projectMemberRepository.findByProjectId(p.getId());
        assertFalse(byProject.isEmpty());
    }
}
