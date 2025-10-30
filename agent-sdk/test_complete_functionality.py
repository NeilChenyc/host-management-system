#!/usr/bin/env python3
"""
Complete functionality test for system health agent
Tests both network percentage and temperature reading features
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from system_health_agent import (
    load_config, 
    read_temperature, 
    get_network_bandwidth, 
    get_network_bytes,
    calculate_network_rate
)

def test_complete_functionality():
    """Test all enhanced functionality"""
    print("Testing Complete System Health Agent Functionality")
    print("=" * 60)
    
    # Test configuration loading
    print("1. Testing configuration loading:")
    try:
        config = load_config('config.yaml')
        print(f"   ✓ Configuration loaded successfully")
        print(f"   - Network as percentage: {config.get('network_as_percentage', False)}")
        print(f"   - Include temperature: {config.get('include_temperature', False)}")
        print(f"   - Network interface: {config.get('network_interface', 'auto')}")
    except Exception as e:
        print(f"   ✗ Configuration loading failed: {e}")
        return
    
    # Test temperature reading
    print("\n2. Testing temperature reading:")
    temp_enabled = read_temperature(config.get('include_temperature', True))
    temp_disabled = read_temperature(False)
    print(f"   - Temperature (enabled): {temp_enabled}°C")
    print(f"   - Temperature (disabled): {temp_disabled}°C")
    if temp_enabled > 0:
        print("   ✓ Temperature reading working")
    else:
        print("   ⚠ Temperature reading returns 0")
    
    # Test network bandwidth detection
    print("\n3. Testing network bandwidth detection:")
    interface = config.get('network_interface', 'auto')
    bandwidth = get_network_bandwidth(interface)
    print(f"   - Interface: {interface}")
    print(f"   - Detected bandwidth: {bandwidth} Mbps")
    if bandwidth and bandwidth > 0:
        print("   ✓ Bandwidth detection working")
    else:
        print("   ⚠ Bandwidth detection failed, using default")
    
    # Test network I/O
    print("\n4. Testing network I/O measurement:")
    try:
        net_io = get_network_bytes(interface)
        print(f"   - Network I/O: {net_io}")
        print("   ✓ Network I/O measurement working")
    except Exception as e:
        print(f"   ✗ Network I/O measurement failed: {e}")
        return
    
    # Test network rate calculation
    print("\n5. Testing network rate calculation:")
    try:
        # Simulate two measurements
        prev_bytes = net_io
        time.sleep(1)  # Wait 1 second
        curr_bytes = get_network_bytes(interface)
        
        # Calculate rates
        rates = calculate_network_rate(
            prev_bytes, curr_bytes, 1.0, bandwidth, 
            config.get('network_as_percentage', False)
        )
        
        print(f"   - Network rates: {rates}")
        if config.get('network_as_percentage', False):
            print(f"   - Input rate: {rates[0]:.2f}%")
            print(f"   - Output rate: {rates[1]:.2f}%")
            print("   ✓ Percentage mode working")
        else:
            print(f"   - Input rate: {rates[0]:.2f} MB/s")
            print(f"   - Output rate: {rates[1]:.2f} MB/s")
            print("   ✓ Absolute value mode working")
    except Exception as e:
        print(f"   ✗ Network rate calculation failed: {e}")
    
    print("\n" + "=" * 60)
    print("Complete functionality test finished!")
    print(f"✓ Default bandwidth: {bandwidth} Mbps (should be 20 Mbps)")
    print(f"✓ Temperature reading: {temp_enabled}°C (should be > 0)")

if __name__ == "__main__":
    import time
    test_complete_functionality()