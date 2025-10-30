package com.elec5619.backend.repository;

import com.elec5619.backend.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class UserRepositoryTest {
    @Autowired UserRepository userRepository;

    @Test
    void saveAndFindById() {
        User u = new User();
        u.setUsername("user1");
        u.setEmail("e1@test");
        u.setPasswordHash("p");
        u.setRole("operation");
        User saved = userRepository.save(u);
        assertNotNull(saved.getId());
        Optional<User> found = userRepository.findById(saved.getId());
        assertTrue(found.isPresent());
        assertEquals("user1", found.get().getUsername());
    }

    @Test
    void findByUsernameAndEmail() {
        User u = new User();
        u.setUsername("user2");
        u.setEmail("e2@test");
        u.setPasswordHash("p");
        u.setRole("operation");
        userRepository.save(u);
        assertTrue(userRepository.findByUsername("user2").isPresent());
        assertTrue(userRepository.findByEmail("e2@test").isPresent());
    }
}
