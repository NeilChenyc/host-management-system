package com.elec5619.backend.repository;

import com.elec5619.backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Role entity.
 * Provides data access methods for role operations.
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    /**
     * Find a role by name.
     * 
     * @param name the role name to search for
     * @return Optional containing the role if found
     */
    Optional<Role> findByName(String name);
    
    /**
     * Check if a role exists by name.
     * 
     * @param name the role name to check
     * @return true if role exists, false otherwise
     */
    boolean existsByName(String name);
}
