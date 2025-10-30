package com.elec5619.backend.repository;

import com.elec5619.backend.entity.Project;
import com.elec5619.backend.entity.ProjectStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ProjectRepositoryTest {
    @Autowired ProjectRepository projectRepository;

    @Test
    void saveAndFindByNameAndStatus() {
        Project p = new Project();
        p.setProjectName("p1");
        p.setStatus(ProjectStatus.PLANNED);
        projectRepository.save(p);
        assertTrue(projectRepository.findByProjectName("p1").isPresent());
        List<Project> planned = projectRepository.findByStatus(ProjectStatus.PLANNED);
        assertFalse(planned.isEmpty());
    }
}
