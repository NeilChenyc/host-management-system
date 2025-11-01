#!/usr/bin/env python3
"""
Test script for network bandwidth detection functionality
"""

import sys
import os
import time

# Add the current directory to Python path to import our module
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from system_health_agent import get_network_bandwidth, get_network_bytes, calculate_network_rate
import psutil

def test_bandwidth_detection():
    """Test network bandwidth detection"""
    print("=== Network Bandwidth Detection Test ===")
    
    # Test bandwidth detection for different interfaces
    interfaces = [None]  # Test combined interfaces first
    
    # Get available network interfaces
    net_io = psutil.net_io_counters(pernic=True)
    for interface in net_io.keys():
        if not interface.startswith('lo'):  # Skip loopback interfaces
            interfaces.append(interface)
    
    for interface in interfaces:
        print(f"\nTesting interface: {interface if interface else 'All interfaces combined'}")
        bandwidth = get_network_bandwidth(interface)
        if bandwidth > 0:
            print(f"  ✓ Detected bandwidth: {bandwidth} Mbps")
        else:
            print(f"  ✗ Could not detect bandwidth (will use absolute values)")

def test_network_rate_calculation():
    """Test network rate calculation with percentage"""
    print("\n=== Network Rate Calculation Test ===")
    
    # Get initial network stats
    print("Getting initial network statistics...")
    initial_bytes = get_network_bytes(None)  # All interfaces
    print(f"Initial bytes - In: {initial_bytes[0]}, Out: {initial_bytes[1]}")
    
    # Wait a bit
    print("Waiting 2 seconds...")
    time.sleep(2)
    
    # Get second measurement
    current_bytes = get_network_bytes(None)
    print(f"Current bytes - In: {current_bytes[0]}, Out: {current_bytes[1]}")
    
    # Test with bandwidth (simulate 1000 Mbps)
    test_bandwidth = 1000
    print(f"\nTesting with simulated bandwidth: {test_bandwidth} Mbps")
    
    rate_in, rate_out = calculate_network_rate(
        initial_bytes, current_bytes, 2, test_bandwidth, as_percentage=True
    )
    print(f"Network rate as percentage - In: {rate_in:.2f}%, Out: {rate_out:.2f}%")
    
    # Test without bandwidth (absolute values)
    print(f"\nTesting without bandwidth (absolute values):")
    rate_in_abs, rate_out_abs = calculate_network_rate(
        initial_bytes, current_bytes, 2, 0, as_percentage=False
    )
    print(f"Network rate absolute - In: {rate_in_abs:.2f} MB/s, Out: {rate_out_abs:.2f} MB/s")

def main():
    """Main test function"""
    print("Network Bandwidth Detection and Rate Calculation Test")
    print("=" * 60)
    
    try:
        test_bandwidth_detection()
        test_network_rate_calculation()
        print("\n" + "=" * 60)
        print("✓ All tests completed successfully!")
        
    except Exception as e:
        print(f"\n✗ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())