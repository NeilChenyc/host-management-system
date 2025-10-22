package com.elec5619.backend.repository;

import com.elec5619.backend.entity.ServerMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for ServerMetrics entity.
 * Provides database operations for server metrics data.
 */
@Repository
public interface ServerMetricsRepository extends JpaRepository<ServerMetrics, Long> {

    /**
     * Find the latest metrics for a specific server
     */
    ServerMetrics findTopByServerIdOrderByCollectedAtDesc(Long serverId);

    /**
     * Find all metrics for a specific server within a time range
     */
    List<ServerMetrics> findByServerIdAndCollectedAtBetweenOrderByCollectedAtDesc(
            Long serverId, LocalDateTime startTime, LocalDateTime endTime);

    /**
     * Find all metrics for a specific server with pagination
     */
    @Query(value = "SELECT * FROM server_metrics WHERE server_id = :serverId ORDER BY collected_at DESC LIMIT :limit OFFSET :offset", nativeQuery = true)
    List<ServerMetrics> findMetricsByServerIdWithPagination(@Param("serverId") Long serverId, @Param("limit") int limit, @Param("offset") int offset);

    /**
     * Find metrics for all servers within a time range
     */
    List<ServerMetrics> findByCollectedAtBetweenOrderByCollectedAtDesc(
            LocalDateTime startTime, LocalDateTime endTime);

    /**
     * Get average metrics for a server over a time period
     */
    @Query("SELECT AVG(sm.cpuUsage), AVG(sm.memoryUsage), AVG(sm.diskUsage), " +
           "AVG(sm.networkIn), AVG(sm.networkOut), AVG(sm.loadAvg), AVG(sm.temperature) " +
           "FROM ServerMetrics sm WHERE sm.serverId = :serverId " +
           "AND sm.collectedAt BETWEEN :startTime AND :endTime")
    Object[] getAverageMetrics(@Param("serverId") Long serverId, 
                              @Param("startTime") LocalDateTime startTime, 
                              @Param("endTime") LocalDateTime endTime);

    /**
     * Count metrics for a server
     */
    long countByServerId(Long serverId);

    /**
     * Delete old metrics (for cleanup)
     */
    void deleteByCollectedAtBefore(LocalDateTime cutoffTime);
}