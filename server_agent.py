#!/usr/bin/env python3
"""
服务器监控Agent - 采集系统指标并推送到监控平台
支持: Windows, Linux, macOS
"""

import psutil
import requests
import time
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('ServerAgent')


class ServerAgent:
    """服务器监控Agent"""
    
    def __init__(self, config_file: str = 'agent_config.json'):
        """初始化Agent"""
        self.config = self.load_config(config_file)
        self.platform_url = self.config['platform_url']
        self.server_id = self.config['server_id']
        self.interval = self.config['interval']
        self.running = False
        
        # 用于计算网络速率
        self.previous_net_io = None
        self.previous_time = None
    
    def load_config(self, config_file: str) -> Dict[str, Any]:
        """加载配置文件"""
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
            logger.info(f"配置加载成功: {config_file}")
            return config
        except FileNotFoundError:
            logger.error(f"配置文件未找到: {config_file}")
            logger.info("创建默认配置文件...")
            default_config = {
                "platform_url": "http://localhost:8080/api/servers/metrics/collect",
                "server_id": 1,
                "interval": 60,
                "log_level": "INFO"
            }
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(default_config, f, indent=2)
            logger.info(f"请编辑 {config_file} 并重新运行")
            exit(1)
        except json.JSONDecodeError as e:
            logger.error(f"配置文件格式错误: {e}")
            exit(1)
    
    def collect_metrics(self) -> Dict[str, Any]:
        """收集系统指标"""
        try:
            metrics = {
                "serverId": self.server_id,
                "cpuUsage": self.get_cpu_usage(),
                "memoryUsage": self.get_memory_usage(),
                "diskUsage": self.get_disk_usage(),
                "networkIn": self.get_network_in(),
                "networkOut": self.get_network_out(),
                "loadAvg": self.get_load_avg(),
                "temperature": self.get_temperature()
            }
            return metrics
        except Exception as e:
            logger.error(f"采集指标失败: {e}")
            return {}
    
    def get_cpu_usage(self) -> Optional[float]:
        """获取CPU使用率"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            return round(cpu_percent, 2)
        except Exception as e:
            logger.debug(f"获取CPU使用率失败: {e}")
            return None
    
    def get_memory_usage(self) -> Optional[float]:
        """获取内存使用率"""
        try:
            mem = psutil.virtual_memory()
            return round(mem.percent, 2)
        except Exception as e:
            logger.debug(f"获取内存使用率失败: {e}")
            return None
    
    def get_disk_usage(self) -> Optional[float]:
        """获取磁盘使用率"""
        try:
            disk = psutil.disk_usage('/')
            return round(disk.percent, 2)
        except Exception as e:
            logger.debug(f"获取磁盘使用率失败: {e}")
            return None
    
    def get_network_in(self) -> Optional[float]:
        """获取入网流量 (MB/s)"""
        try:
            net_io = psutil.net_io_counters()
            current_time = time.time()
            
            if self.previous_net_io and self.previous_time:
                time_delta = current_time - self.previous_time
                if time_delta > 0:
                    bytes_recv_delta = net_io.bytes_recv - self.previous_net_io.bytes_recv
                    # 转换为 MB/s
                    rate = (bytes_recv_delta / time_delta) / (1024 * 1024)
                    return round(rate, 2)
            
            # 保存当前值供下次计算
            self.previous_net_io = net_io
            self.previous_time = current_time
            return 0.0
        except Exception as e:
            logger.debug(f"获取入网流量失败: {e}")
            return None
    
    def get_network_out(self) -> Optional[float]:
        """获取出网流量 (MB/s)"""
        try:
            net_io = psutil.net_io_counters()
            current_time = time.time()
            
            if self.previous_net_io and self.previous_time:
                time_delta = current_time - self.previous_time
                if time_delta > 0:
                    bytes_sent_delta = net_io.bytes_sent - self.previous_net_io.bytes_sent
                    # 转换为 MB/s
                    rate = (bytes_sent_delta / time_delta) / (1024 * 1024)
                    return round(rate, 2)
            
            return 0.0
        except Exception as e:
            logger.debug(f"获取出网流量失败: {e}")
            return None
    
    def get_load_avg(self) -> Optional[float]:
        """获取系统负载（仅Linux/Mac）"""
        try:
            if hasattr(psutil, 'getloadavg'):
                load_avg = psutil.getloadavg()[0]  # 1分钟平均负载
                return round(load_avg, 2)
            else:
                # Windows不支持load average
                return None
        except Exception as e:
            logger.debug(f"获取系统负载失败: {e}")
            return None
    
    def get_temperature(self) -> Optional[float]:
        """获取CPU温度（如果支持）"""
        try:
            if hasattr(psutil, 'sensors_temperatures'):
                temps = psutil.sensors_temperatures()
                if temps:
                    # 尝试获取CPU温度
                    for name, entries in temps.items():
                        if 'coretemp' in name.lower() or 'cpu' in name.lower():
                            if entries:
                                return round(entries[0].current, 2)
        except Exception as e:
            logger.debug(f"获取温度失败: {e}")
        return None
    
    def send_metrics(self, metrics: Dict[str, Any]) -> bool:
        """发送指标到平台"""
        try:
            response = requests.post(
                self.platform_url,
                json=metrics,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                logger.info(f"✓ 指标推送成功 (HTTP {response.status_code})")
                try:
                    result = response.json()
                    logger.debug(f"响应: {result}")
                except:
                    pass
                return True
            else:
                logger.error(f"✗ 推送失败: HTTP {response.status_code}")
                logger.error(f"响应内容: {response.text}")
                return False
                
        except requests.exceptions.Timeout:
            logger.error("✗ 请求超时")
            return False
        except requests.exceptions.ConnectionError:
            logger.error("✗ 连接失败 - 无法连接到平台")
            return False
        except Exception as e:
            logger.error(f"✗ 发送指标时出错: {e}")
            return False
    
    def print_banner(self):
        """打印启动信息"""
        print("=" * 70)
        print("                 服务器监控Agent")
        print("=" * 70)
        print(f"服务器ID:        {self.server_id}")
        print(f"平台地址:        {self.platform_url}")
        print(f"采集间隔:        {self.interval} 秒")
        print(f"启动时间:        {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 70)
        print()
    
    def collect_and_send(self):
        """采集并发送指标"""
        try:
            # 采集指标
            metrics = self.collect_metrics()
            
            if not metrics:
                logger.error("未能采集到指标数据")
                return
            
            # 打印摘要
            logger.info("=" * 50)
            logger.info(f"采集时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            if metrics.get('cpuUsage') is not None:
                logger.info(f"  CPU使用率:    {metrics['cpuUsage']}%")
            if metrics.get('memoryUsage') is not None:
                logger.info(f"  内存使用率:   {metrics['memoryUsage']}%")
            if metrics.get('diskUsage') is not None:
                logger.info(f"  磁盘使用率:   {metrics['diskUsage']}%")
            if metrics.get('networkIn') is not None:
                logger.info(f"  入网流量:     {metrics['networkIn']} MB/s")
            if metrics.get('networkOut') is not None:
                logger.info(f"  出网流量:     {metrics['networkOut']} MB/s")
            if metrics.get('loadAvg') is not None:
                logger.info(f"  系统负载:     {metrics['loadAvg']}")
            if metrics.get('temperature') is not None:
                logger.info(f"  CPU温度:      {metrics['temperature']}°C")
            
            # 发送指标
            self.send_metrics(metrics)
            
        except KeyboardInterrupt:
            raise
        except Exception as e:
            logger.error(f"采集发送过程出错: {e}")
    
    def run(self):
        """运行Agent主循环"""
        self.print_banner()
        self.running = True
        
        logger.info("Agent启动成功，开始监控...")
        logger.info(f"按 Ctrl+C 停止运行\n")
        
        try:
            while self.running:
                self.collect_and_send()
                logger.debug(f"等待 {self.interval} 秒...")
                time.sleep(self.interval)
                
        except KeyboardInterrupt:
            logger.info("\n\n收到停止信号，正在关闭...")
            self.running = False
        except Exception as e:
            logger.error(f"致命错误: {e}")
            raise
        finally:
            logger.info("Agent已停止")


def main():
    """主函数"""
    try:
        agent = ServerAgent()
        agent.run()
    except Exception as e:
        logger.error(f"启动失败: {e}")
        exit(1)


if __name__ == "__main__":
    main()

