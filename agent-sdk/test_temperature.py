#!/usr/bin/env python3
"""
Test script for temperature reading functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from system_health_agent import read_temperature

def test_temperature_reading():
    """Test temperature reading with different configurations"""
    print("Testing temperature reading functionality...")
    print("=" * 50)
    
    # Test with temperature reading enabled
    print("1. Testing with temperature reading enabled:")
    temp_enabled = read_temperature(include=True)
    print(f"   Temperature (enabled): {temp_enabled}°C")
    
    # Test with temperature reading disabled
    print("\n2. Testing with temperature reading disabled:")
    temp_disabled = read_temperature(include=False)
    print(f"   Temperature (disabled): {temp_disabled}°C")
    
    # Validate results
    print("\n3. Validation:")
    if temp_disabled == 0.0:
        print("   ✓ Temperature correctly returns 0.0 when disabled")
    else:
        print("   ✗ Temperature should return 0.0 when disabled")
    
    if temp_enabled >= 0.0:
        print(f"   ✓ Temperature reading successful: {temp_enabled}°C")
        if temp_enabled > 0.0:
            print("   ✓ Non-zero temperature detected")
        else:
            print("   ⚠ Temperature is 0.0 - may indicate detection failure")
    else:
        print("   ✗ Invalid temperature reading")
    
    print("\n" + "=" * 50)
    print("Temperature test completed!")
    
    return temp_enabled

if __name__ == "__main__":
    test_temperature_reading()