#!/usr/bin/env python3
"""
Simple temperature test
"""

import psutil

def simple_temp_simulation():
    """Test the CPU-based temperature simulation"""
    print("Testing CPU-based temperature simulation...")
    
    try:
        cpu_percent = psutil.cpu_percent(interval=0.1)
        print(f"CPU usage: {cpu_percent}%")
        
        # Simulate temperature: base 30°C + CPU usage factor
        simulated_temp = 30.0 + (cpu_percent * 0.5)  # Max ~80°C at 100% CPU
        final_temp = min(simulated_temp, 85.0)  # Cap at reasonable maximum
        
        print(f"Simulated temperature: {simulated_temp}°C")
        print(f"Final temperature (capped): {final_temp}°C")
        
        return final_temp
    except Exception as e:
        print(f"Error: {e}")
        return 0.0

if __name__ == "__main__":
    temp = simple_temp_simulation()
    print(f"Result: {temp}°C")