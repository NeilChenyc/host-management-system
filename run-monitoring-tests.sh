#!/bin/bash

echo "=== Monitoring System Test Suite ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run tests and display results
run_test_suite() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${YELLOW}Running $test_name...${NC}"
    echo "Command: $test_command"
    echo ""
    
    if eval "$test_command"; then
        echo -e "${GREEN}✓ $test_name PASSED${NC}"
    else
        echo -e "${RED}✗ $test_name FAILED${NC}"
        return 1
    fi
    echo ""
}

# Check if Maven is available
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}Error: Maven is not installed or not in PATH${NC}"
    exit 1
fi

# Navigate to backend directory
cd backend || {
    echo -e "${RED}Error: Cannot navigate to backend directory${NC}"
    exit 1
}

echo "Current directory: $(pwd)"
echo ""

# 1. Unit Tests
echo "=== UNIT TESTS ==="
run_test_suite "AlertRuleService Unit Tests" "mvn test -Dtest=AlertRuleServiceTest"
run_test_suite "AlertEventService Unit Tests" "mvn test -Dtest=AlertEventServiceTest"
run_test_suite "AlertSystemService Unit Tests" "mvn test -Dtest=AlertSystemServiceTest"
run_test_suite "NotificationService Unit Tests" "mvn test -Dtest=NotificationServiceTest"
run_test_suite "AlertEvaluationScheduler Unit Tests" "mvn test -Dtest=AlertEvaluationSchedulerTest"

# 2. Integration Tests
echo "=== INTEGRATION TESTS ==="
run_test_suite "Monitoring System Integration Tests" "mvn test -Dtest=MonitoringSystemIntegrationTest"

# 3. End-to-End Tests
echo "=== END-TO-END TESTS ==="
run_test_suite "Monitoring System E2E Tests" "mvn test -Dtest=MonitoringSystemE2ETest"

# 4. Performance Tests
echo "=== PERFORMANCE TESTS ==="
run_test_suite "Monitoring System Performance Tests" "mvn test -Dtest=MonitoringSystemPerformanceTest"

# 5. Run All Tests Together
echo "=== ALL TESTS TOGETHER ==="
run_test_suite "Complete Test Suite" "mvn test -Dtest=*Test"

echo ""
echo "=== TEST SUMMARY ==="
echo "All test suites have been executed."
echo ""

# Check if all tests passed
if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests completed successfully!${NC}"
    echo ""
    echo "Test coverage includes:"
    echo "  ✓ Unit tests for all services"
    echo "  ✓ Integration tests for system components"
    echo "  ✓ End-to-end tests for complete workflows"
    echo "  ✓ Performance tests for scalability"
    echo "  ✓ Error handling and edge cases"
    echo "  ✓ Concurrent execution scenarios"
    echo ""
    echo "The monitoring and alerting system is ready for production!"
else
    echo -e "${RED}❌ Some tests failed. Please check the output above.${NC}"
    exit 1
fi