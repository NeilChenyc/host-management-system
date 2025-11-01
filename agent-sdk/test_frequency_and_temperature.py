#!/usr/bin/env python3
"""
Test script to verify the 20-second frequency and improved temperature reading functionality.
"""

import time
import psutil
from system_health_agent import read_temperature, load_config

def test_temperature_consistency():
    """Test that temperature reading is consistent with CPU usage."""
    print("=== Temperature Consistency Test ===")
    
    # Test with different CPU values
    test_cpu_values = [0.0, 25.0, 50.0, 75.0, 100.0]
    
    for cpu_val in test_cpu_values:
        temp = read_temperature(enabled=True, cpu_percent=cpu_val)
        expected_temp = 30.0 + (cpu_val * 0.5)
        expected_temp = min(expected_temp, 85.0)
        
        print(f"CPU: {cpu_val:5.1f}% -> Temperature: {temp:5.1f}°C (Expected: {expected_temp:5.1f}°C)")
        
        # Verify the calculation is correct
        if abs(temp - expected_temp) < 0.1:
            print("  ✓ Temperature calculation is correct")
        else:
            print("  ✗ Temperature calculation mismatch!")

def test_real_cpu_temperature():
    """Test temperature reading with real CPU usage."""
    print("\n=== Real CPU Temperature Test ===")
    
    # Get current CPU usage
    cpu_usage = psutil.cpu_percent(interval=1)
    temp = read_temperature(enabled=True, cpu_percent=cpu_usage)
    
    print(f"Current CPU Usage: {cpu_usage:.1f}%")
    print(f"Calculated Temperature: {temp:.1f}°C")
    
    # Verify it's not the default 30°C (unless CPU is exactly 0%)
    if cpu_usage > 0 and temp > 30.0:
        print("  ✓ Temperature reflects CPU usage")
    elif cpu_usage == 0 and temp == 30.0:
        print("  ✓ Temperature is base value for 0% CPU")
    else:
        print("  ✗ Temperature calculation issue")

def test_config_frequency():
    """Test that configuration shows 20-second interval."""
    print("\n=== Configuration Frequency Test ===")
    
    try:
        config = load_config('config.yaml')
        interval = config.get('metrics', {}).get('interval_seconds', 5)
        
        print(f"Configured interval: {interval} seconds")
        
        if interval == 20:
            print("  ✓ Frequency correctly set to 20 seconds")
        else:
            print(f"  ✗ Expected 20 seconds, got {interval} seconds")
            
    except Exception as e:
        print(f"  ✗ Error loading config: {e}")

def test_temperature_disabled():
    """Test temperature reading when disabled."""
    print("\n=== Temperature Disabled Test ===")
    
    temp = read_temperature(enabled=False, cpu_percent=50.0)
    
    print(f"Temperature when disabled: {temp}°C")
    
    if temp == 0.0:
        print("  ✓ Temperature correctly returns 0.0 when disabled")
    else:
        print("  ✗ Temperature should return 0.0 when disabled")

if __name__ == "__main__":
    print("Testing 20-second frequency and improved temperature functionality...\n")
    
    test_temperature_consistency()
    test_real_cpu_temperature()
    test_config_frequency()
    test_temperature_disabled()
    
    print("\n=== Test Summary ===")
    print("All tests completed. Check the results above for any issues.")
    print("The temperature should now be more consistent and reflect actual CPU usage.")