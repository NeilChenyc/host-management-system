package com.elec5619.backend.repository;

import com.elec5619.backend.entity.ServerMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for ServerMetrics entity.
 * Provides CRUD operations and custom query methods for ServerMetrics data.
 */
@Repository
public interface ServerMetricsRepository extends JpaRepository<ServerMetrics, Long> {

    /**
     * Finds all metrics for a specific server by serverId.
     *
     * @param serverId the ID of the server
     * @return list of ServerMetrics for the specified server
     */
    List<ServerMetrics> findByServerId(Long serverId);

    /**
     * Finds metrics for a specific server within a time range.
     *
     * @param serverId the ID of the server
     * @param startDateTime the start of the time range
     * @param endDateTime the end of the time range
     * @return list of ServerMetrics within the specified time range
     */
    List<ServerMetrics> findByServerIdAndCollectedAtBetween(Long serverId, LocalDateTime startDateTime, LocalDateTime endDateTime);

    /**
     * Finds the latest metrics for a specific server.
     *
     * @param serverId the ID of the server
     * @return the latest ServerMetrics record for the specified server
     */
    ServerMetrics findTopByServerIdOrderByCollectedAtDesc(Long serverId);

    /**
     * Deletes all metrics for a specific server by serverId.
     *
     * @param serverId the ID of the server
     */
    void deleteByServerId(Long serverId);
}