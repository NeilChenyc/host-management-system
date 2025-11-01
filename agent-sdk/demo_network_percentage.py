#!/usr/bin/env python3
"""
Demo script showing network percentage functionality
This script demonstrates how the agent now displays network usage as percentage of bandwidth
"""

import sys
import os
import time
import yaml

# Add the current directory to Python path to import our module
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from system_health_agent import get_network_bandwidth, get_network_bytes, calculate_network_rate

def load_demo_config():
    """Load configuration for demo"""
    try:
        with open('config.yaml', 'r') as f:
            return yaml.safe_load(f)
    except FileNotFoundError:
        print("Config file not found, using default settings")
        return {
            'metrics': {
                'network_interface': None,
                'network_as_percentage': True
            }
        }

def demo_network_monitoring():
    """Demonstrate network monitoring with percentage display"""
    print("🌐 Network Monitoring Demo - Percentage Mode")
    print("=" * 60)
    
    # Load configuration
    config = load_demo_config()
    network_interface = config.get('metrics', {}).get('network_interface')
    use_percentage = config.get('metrics', {}).get('network_as_percentage', True)
    
    print(f"📡 Network Interface: {network_interface if network_interface else 'All interfaces combined'}")
    print(f"📊 Display Mode: {'Percentage of bandwidth' if use_percentage else 'Absolute MB/s'}")
    
    # Detect network bandwidth
    print(f"\n🔍 Detecting network bandwidth...")
    bandwidth = get_network_bandwidth(network_interface)
    
    if bandwidth > 0:
        print(f"✅ Network bandwidth detected: {bandwidth} Mbps")
        if use_percentage:
            print(f"📈 Network usage will be displayed as percentage of {bandwidth} Mbps")
        else:
            print(f"📊 Network usage will be displayed in absolute MB/s (percentage mode disabled)")
    else:
        print(f"❌ Could not detect network bandwidth")
        print(f"📊 Network usage will be displayed in absolute MB/s (fallback mode)")
        use_percentage = False
    
    print(f"\n⏱️  Starting network monitoring (press Ctrl+C to stop)...")
    print(f"{'Time':<8} {'Network In':<15} {'Network Out':<15} {'Status'}")
    print("-" * 60)
    
    # Initialize tracking
    prev_bytes = None
    prev_time = None
    
    try:
        while True:
            # Get current network stats
            curr_time = time.time()
            curr_bytes = get_network_bytes(network_interface)
            
            if prev_bytes is not None and prev_time is not None:
                time_delta = curr_time - prev_time
                
                # Calculate rates
                if use_percentage and bandwidth > 0:
                    rate_in, rate_out = calculate_network_rate(
                        prev_bytes, curr_bytes, time_delta, 
                        bandwidth, as_percentage=True
                    )
                    unit = "%"
                    status = f"of {bandwidth} Mbps"
                else:
                    rate_in, rate_out = calculate_network_rate(
                        prev_bytes, curr_bytes, time_delta, 
                        as_percentage=False
                    )
                    unit = "MB/s"
                    status = "absolute"
                
                # Display results
                timestamp = time.strftime("%H:%M:%S")
                print(f"{timestamp:<8} {rate_in:>8.2f} {unit:<6} {rate_out:>8.2f} {unit:<6} {status}")
            
            # Update tracking variables
            prev_bytes = curr_bytes
            prev_time = curr_time
            
            time.sleep(2)  # Update every 2 seconds
            
    except KeyboardInterrupt:
        print(f"\n\n🛑 Monitoring stopped by user")
        print(f"✅ Demo completed successfully!")

def main():
    """Main demo function"""
    print("Network Bandwidth Percentage Demo")
    print("This demo shows how the agent displays network usage as percentage of detected bandwidth")
    print()
    
    try:
        demo_network_monitoring()
    except Exception as e:
        print(f"\n❌ Demo failed with error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())