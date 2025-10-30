package com.elec5619.backend.repository;

import com.elec5619.backend.entity.Server;
import com.elec5619.backend.entity.ServerStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ServerRepositoryTest {
    @Autowired ServerRepository serverRepository;

    @Test
    void saveAndFindByName() {
        Server s = new Server();
        s.setServerName("srv");
        s.setIpAddress("1.2.3.4");
        s.setStatus(ServerStatus.online);
        Server saved = serverRepository.save(s);
        assertNotNull(saved.getId());
        assertTrue(serverRepository.findByServerName("srv").isPresent());
    }
}
