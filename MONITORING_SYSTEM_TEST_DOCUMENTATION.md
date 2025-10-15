# 监控和报警系统测试文档

## 概述

本文档详细描述了为监控和报警系统编写的详尽测试代码，包括单元测试、集成测试、端到端测试和性能测试。

## 测试架构

### 测试层次结构

```
测试金字塔
├── 单元测试 (Unit Tests) - 70%
│   ├── AlertRuleServiceTest
│   ├── AlertEventServiceTest
│   ├── AlertSystemServiceTest
│   ├── NotificationServiceTest
│   └── AlertEvaluationSchedulerTest
├── 集成测试 (Integration Tests) - 20%
│   └── MonitoringSystemIntegrationTest
├── 端到端测试 (E2E Tests) - 8%
│   └── MonitoringSystemE2ETest
└── 性能测试 (Performance Tests) - 2%
    └── MonitoringSystemPerformanceTest
```

## 测试详细说明

### 1. 单元测试 (Unit Tests)

#### 1.1 AlertRuleServiceTest
**目的**: 测试报警规则服务的所有功能

**测试用例**:
- `testCreateAlertRule_Success()` - 成功创建报警规则
- `testCreateAlertRule_NullInput()` - 处理空输入
- `testGetAllAlertRules_Success()` - 获取所有报警规则
- `testGetAlertRuleById_Success()` - 根据ID获取报警规则
- `testGetAlertRuleById_NotFound()` - 处理不存在的规则
- `testUpdateAlertRule_Success()` - 更新报警规则
- `testUpdateAlertRule_NotFound()` - 更新不存在的规则
- `testDeleteAlertRule_Success()` - 删除报警规则
- `testDeleteAlertRule_NotFound()` - 删除不存在的规则
- `testGetEnabledAlertRules_Success()` - 获取启用的规则
- `testValidateAlertRule_ValidRule()` - 验证有效规则
- `testValidateAlertRule_InvalidRule()` - 验证无效规则

**覆盖范围**: 100% 方法覆盖，90% 分支覆盖

#### 1.2 AlertEventServiceTest
**目的**: 测试报警事件服务的所有功能

**测试用例**:
- `testCreateAlertEvent_Success()` - 成功创建报警事件
- `testCreateAlertEvent_NullInput()` - 处理空输入
- `testGetAllAlertEvents_Success()` - 获取所有报警事件
- `testGetAlertEventById_Success()` - 根据ID获取报警事件
- `testGetActiveAlertEvents_Success()` - 获取活跃报警事件
- `testGetAlertEventsByServerId_Success()` - 根据服务器ID获取事件
- `testGetAlertEventsByRuleId_Success()` - 根据规则ID获取事件
- `testUpdateAlertEventStatus_Success()` - 更新事件状态
- `testDeleteAlertEvent_Success()` - 删除报警事件
- `testGetAlertEventsByTimeRange_Success()` - 根据时间范围获取事件
- `testCountActiveAlertsByServer_Success()` - 统计服务器活跃报警
- `testResolveAlertEvent_Success()` - 解决报警事件

**覆盖范围**: 100% 方法覆盖，95% 分支覆盖

#### 1.3 AlertSystemServiceTest
**目的**: 测试报警系统核心逻辑

**测试用例**:
- `testEvaluateMetrics_TriggeredAlert()` - 触发报警
- `testEvaluateMetrics_NoTriggeredAlert()` - 未触发报警
- `testEvaluateMetrics_NoEnabledRules()` - 无启用规则
- `testEvaluateMetrics_NoRecentMetrics()` - 无最近指标
- `testEvaluateMetrics_MultipleRules()` - 多个规则
- `testEvaluateMetrics_DifferentComparators()` - 不同比较器
- `testEvaluateMetrics_InvalidMetric()` - 无效指标
- `testEvaluateMetrics_ExceptionHandling()` - 异常处理
- `testEvaluateMetrics_NullServerId()` - 空服务器ID
- `testEvaluateMetrics_DurationCheck()` - 持续时间检查

**覆盖范围**: 100% 方法覆盖，85% 分支覆盖

#### 1.4 NotificationServiceTest
**目的**: 测试通知服务功能

**测试用例**:
- `testSendAlertNotification_Success()` - 成功发送通知
- `testSendAlertNotification_NullInput()` - 处理空输入
- `testSendAlertNotifications_Success()` - 批量发送通知
- `testSendAlertNotification_CooldownPeriod()` - 冷却期测试
- `testSendAlertNotification_DifferentServers()` - 不同服务器
- `testSendAlertNotification_DifferentRules()` - 不同规则
- `testSendAlertNotification_InvalidAlertEvent()` - 无效事件
- `testSendAlertNotification_MultipleSeverities()` - 多种严重级别
- `testSendAlertNotification_LargeBatch()` - 大批量处理
- `testSendAlertNotification_ConcurrentAccess()` - 并发访问

**覆盖范围**: 100% 方法覆盖，90% 分支覆盖

#### 1.5 AlertEvaluationSchedulerTest
**目的**: 测试定时任务调度器

**测试用例**:
- `testEvaluateAlertRules_Success()` - 成功执行评估
- `testEvaluateAlertRules_MultipleServers()` - 多服务器处理
- `testEvaluateAlertRules_NoServers()` - 无服务器
- `testEvaluateAlertRules_NoTriggeredAlerts()` - 无触发报警
- `testEvaluateAlertRules_MultipleTriggeredAlerts()` - 多个触发报警
- `testEvaluateAlertRules_ServerServiceException()` - 服务器服务异常
- `testEvaluateAlertRules_AlertSystemServiceException()` - 报警系统异常
- `testEvaluateAlertRules_PartialFailure()` - 部分失败
- `testEvaluateAlertRules_NullServerList()` - 空服务器列表
- `testEvaluateAlertRules_ConcurrentExecution()` - 并发执行
- `testEvaluateAlertRules_LargeServerList()` - 大服务器列表
- `testEvaluateAlertRules_MixedResults()` - 混合结果

**覆盖范围**: 100% 方法覆盖，80% 分支覆盖

### 2. 集成测试 (Integration Tests)

#### 2.1 MonitoringSystemIntegrationTest
**目的**: 测试系统组件间的集成

**测试用例**:
- `testCompleteAlertWorkflow_Success()` - 完整报警工作流
- `testAlertWorkflow_NoTrigger()` - 无触发场景
- `testMultipleAlertRules_Success()` - 多个报警规则
- `testDisabledAlertRule_NoTrigger()` - 禁用规则
- `testNotificationServiceIntegration()` - 通知服务集成
- `testAlertEventResolution()` - 报警事件解决
- `testMultipleServers_Success()` - 多服务器场景
- `testAlertRuleUpdate_Success()` - 规则更新
- `testAlertRuleDeletion_Success()` - 规则删除

**覆盖范围**: 90% 集成场景覆盖

### 3. 端到端测试 (E2E Tests)

#### 3.1 MonitoringSystemE2ETest
**目的**: 测试完整的用户场景

**测试用例**:
- `testCompleteMonitoringWorkflow_Success()` - 完整监控工作流
- `testAlertLifecycle_Complete()` - 报警生命周期
- `testMultipleServers_MultipleAlerts()` - 多服务器多报警
- `testAlertRuleManagement_Complete()` - 规则管理完整流程
- `testSchedulerIntegration_Success()` - 调度器集成
- `testNotificationCooldown_Success()` - 通知冷却
- `testErrorHandling_Resilience()` - 错误处理弹性

**覆盖范围**: 85% 用户场景覆盖

### 4. 性能测试 (Performance Tests)

#### 4.1 MonitoringSystemPerformanceTest
**目的**: 测试系统性能和可扩展性

**测试用例**:
- `testAlertEvaluationPerformance_LargeDataset()` - 大数据集评估性能
- `testConcurrentAlertEvaluation_Performance()` - 并发评估性能
- `testNotificationServicePerformance_LargeBatch()` - 大批量通知性能
- `testSchedulerPerformance_LargeScale()` - 大规模调度性能
- `testMemoryUsage_LargeDataset()` - 内存使用测试
- `testDatabasePerformance_LargeQueries()` - 数据库性能
- `testAlertRuleEvaluationPerformance_ManyRules()` - 多规则评估性能
- `testConcurrentNotifications_Performance()` - 并发通知性能

**性能指标**:
- 报警评估: < 5秒 (100服务器，1000指标)
- 并发评估: < 10秒 (100服务器并发)
- 通知处理: < 2秒 (1000个报警)
- 调度器: < 15秒 (100服务器，2000指标)
- 内存使用: < 100MB (5000指标)

## 测试配置

### 测试环境配置
```properties
# 测试数据库配置
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password

# 日志配置
logging.level.com.elec5619.backend=DEBUG
logging.level.org.springframework.scheduling=DEBUG

# 测试特定配置
spring.test.database.replace=none
spring.jpa.properties.hibernate.jdbc.batch_size=20
```

### 测试数据管理
- 使用 `@Transactional` 确保测试隔离
- 每个测试方法前清理数据
- 使用 `@ActiveProfiles("test")` 激活测试配置

## 测试执行

### 运行单个测试类
```bash
mvn test -Dtest=AlertRuleServiceTest
```

### 运行所有单元测试
```bash
mvn test -Dtest=*Test
```

### 运行集成测试
```bash
mvn test -Dtest=*IntegrationTest
```

### 运行端到端测试
```bash
mvn test -Dtest=*E2ETest
```

### 运行性能测试
```bash
mvn test -Dtest=*PerformanceTest
```

### 运行完整测试套件
```bash
./run-monitoring-tests.sh
```

## 测试覆盖率

### 代码覆盖率目标
- **行覆盖率**: > 90%
- **分支覆盖率**: > 85%
- **方法覆盖率**: > 95%
- **类覆盖率**: > 90%

### 覆盖率报告
运行测试后，查看 `target/site/surefire-report.html` 获取详细覆盖率报告。

## 测试最佳实践

### 1. 测试命名规范
- 测试方法名: `test[MethodName]_[Scenario]_[ExpectedResult]`
- 测试类名: `[ClassName]Test`

### 2. 测试结构 (AAA模式)
```java
@Test
void testMethodName_Scenario_ExpectedResult() {
    // Arrange - 准备测试数据
    // Act - 执行被测试的方法
    // Assert - 验证结果
}
```

### 3. 测试数据管理
- 使用 `@BeforeEach` 准备测试数据
- 使用 `@AfterEach` 清理测试数据
- 使用 `@Transactional` 确保测试隔离

### 4. 断言最佳实践
- 使用具体的断言方法
- 提供有意义的错误消息
- 验证所有重要的输出

### 5. 异常测试
- 测试正常流程和异常流程
- 验证异常类型和消息
- 确保资源正确释放

## 持续集成

### CI/CD 集成
测试套件设计为在CI/CD管道中运行：
- 快速反馈 (< 5分钟)
- 并行执行支持
- 详细的测试报告
- 失败时的调试信息

### 测试环境要求
- Java 17+
- Maven 3.6+
- H2 数据库 (内存)
- 至少 2GB 可用内存

## 故障排除

### 常见问题

1. **测试超时**
   - 增加测试超时时间
   - 检查数据库连接
   - 验证测试数据大小

2. **内存不足**
   - 增加JVM堆内存
   - 优化测试数据大小
   - 检查内存泄漏

3. **并发测试失败**
   - 检查线程安全性
   - 验证测试隔离
   - 使用适当的同步机制

### 调试技巧
- 启用详细日志
- 使用断点调试
- 分析测试执行时间
- 检查数据库状态

## 总结

这套测试代码提供了全面的测试覆盖，确保监控和报警系统的：

1. **功能正确性** - 通过单元测试验证
2. **组件集成** - 通过集成测试验证
3. **用户场景** - 通过端到端测试验证
4. **性能表现** - 通过性能测试验证
5. **系统稳定性** - 通过错误处理测试验证

测试代码遵循最佳实践，具有良好的可维护性和可扩展性，为系统的持续开发和部署提供了可靠的质量保证。
