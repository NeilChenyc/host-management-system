#!/usr/bin/env python3
"""
Debug script for temperature reading functionality
"""

import sys
import os
import platform
import subprocess
import re
import psutil

def debug_temperature_methods():
    """Debug each temperature reading method step by step"""
    print("Debugging temperature reading methods...")
    print("=" * 60)
    
    # Test psutil sensors
    print("1. Testing psutil.sensors_temperatures():")
    try:
        temps = psutil.sensors_temperatures()
        print(f"   Result: {temps}")
        if temps:
            for name, entries in temps.items():
                print(f"   Sensor '{name}': {entries}")
                if entries:
                    print(f"   First temperature: {entries[0].current}°C")
        else:
            print("   No sensors found via psutil")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test system detection
    system = platform.system()
    print(f"\n2. System detected: {system}")
    
    if system == "Darwin":  # macOS
        print("\n3. Testing macOS-specific methods:")
        
        # Test osx-cpu-temp
        print("   a) Testing osx-cpu-temp:")
        try:
            result = subprocess.run(['osx-cpu-temp'], 
                                  capture_output=True, text=True, timeout=5)
            print(f"      Return code: {result.returncode}")
            print(f"      Stdout: '{result.stdout.strip()}'")
            print(f"      Stderr: '{result.stderr.strip()}'")
            if result.returncode == 0:
                temp_str = result.stdout.strip().replace('°C', '').replace('C', '')
                print(f"      Parsed temperature: '{temp_str}'")
                try:
                    temp_val = float(temp_str)
                    print(f"      Float value: {temp_val}")
                except ValueError as ve:
                    print(f"      Float conversion error: {ve}")
        except Exception as e:
            print(f"      Error: {e}")
        
        # Test pmset
        print("   b) Testing pmset -g therm:")
        try:
            result = subprocess.run(['pmset', '-g', 'therm'], 
                                  capture_output=True, text=True, timeout=5)
            print(f"      Return code: {result.returncode}")
            print(f"      Stdout: '{result.stdout.strip()}'")
            if result.returncode == 0:
                if 'No thermal pressure' in result.stdout:
                    print("      -> Would return 25.0°C (normal)")
                elif 'thermal pressure' in result.stdout.lower():
                    print("      -> Would return 45.0°C (elevated)")
        except Exception as e:
            print(f"      Error: {e}")
    
    # Test CPU-based simulation
    print("\n4. Testing CPU-based temperature simulation:")
    try:
        cpu_percent = psutil.cpu_percent(interval=0.1)
        print(f"   CPU usage: {cpu_percent}%")
        simulated_temp = 30.0 + (cpu_percent * 0.5)
        final_temp = min(simulated_temp, 85.0)
        print(f"   Simulated temperature: {simulated_temp}°C")
        print(f"   Final temperature (capped): {final_temp}°C")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n" + "=" * 60)
    print("Debug completed!")

if __name__ == "__main__":
    debug_temperature_methods()