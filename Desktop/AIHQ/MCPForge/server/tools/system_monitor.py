"""
System Monitor Tools for MCPForge
Provides system status and monitoring capabilities as MCP tools.
"""

import platform
import psutil
import os
from datetime import datetime
from typing import Dict, Any
from mcp.server.fastmcp import FastMCP

class SystemMonitor:
    """Monitors system status and provides information as MCP tools."""

    def register_tools(self, mcp: FastMCP) -> None:
        """Register all system monitoring tools with the MCP server."""

        @mcp.tool()
        def get_system_info() -> str:
            """Get basic system information.

            Returns:
                System information summary
            """
            try:
                info = {
                    "OS": platform.system(),
                    "OS Version": platform.version(),
                    "Architecture": platform.machine(),
                    "Python Version": platform.python_version(),
                    "CPU Cores": os.cpu_count(),
                    "Current Time": datetime.now().isoformat()
                }

                return "System Information:\n" + "\n".join(f"{k}: {v}" for k, v in info.items())

            except Exception as e:
                return f"Error getting system info: {str(e)}"

        @mcp.tool()
        def get_memory_usage() -> str:
            """Get current memory usage statistics.

            Returns:
                Memory usage information
            """
            try:
                memory = psutil.virtual_memory()

                info = {
                    "Total Memory": f"{memory.total / (1024**3):.2f} GB",
                    "Available Memory": f"{memory.available / (1024**3):.2f} GB",
                    "Used Memory": f"{memory.used / (1024**3):.2f} GB",
                    "Memory Usage": f"{memory.percent}%",
                    "Cached Memory": f"{memory.cached / (1024**3):.2f} GB" if hasattr(memory, 'cached') else "N/A"
                }

                return "Memory Usage:\n" + "\n".join(f"{k}: {v}" for k, v in info.items())

            except ImportError:
                return "Memory monitoring requires 'psutil' package. Install with: pip install psutil"
            except Exception as e:
                return f"Error getting memory usage: {str(e)}"

        @mcp.tool()
        def get_disk_usage(path: str = "/") -> str:
            """Get disk usage statistics for a path.

            Args:
                path: Path to check disk usage for (default: root)

            Returns:
                Disk usage information
            """
            try:
                disk = psutil.disk_usage(path)

                info = {
                    "Path": path,
                    "Total Space": f"{disk.total / (1024**3):.2f} GB",
                    "Used Space": f"{disk.used / (1024**3):.2f} GB",
                    "Free Space": f"{disk.free / (1024**3):.2f} GB",
                    "Disk Usage": f"{disk.percent}%"
                }

                return f"Disk Usage for {path}:\n" + "\n".join(f"{k}: {v}" for k, v in info.items())

            except ImportError:
                return "Disk monitoring requires 'psutil' package. Install with: pip install psutil"
            except Exception as e:
                return f"Error getting disk usage: {str(e)}"

        @mcp.tool()
        def get_process_count() -> str:
            """Get the number of running processes.

            Returns:
                Process count information
            """
            try:
                process_count = len(psutil.pids())

                return f"Running Processes: {process_count}"

            except ImportError:
                return "Process monitoring requires 'psutil' package. Install with: pip install psutil"
            except Exception as e:
                return f"Error getting process count: {str(e)}"

        @mcp.tool()
        def get_uptime() -> str:
            """Get system uptime information.

            Returns:
                System uptime
            """
            try:
                boot_time = psutil.boot_time()
                uptime_seconds = datetime.now().timestamp() - boot_time

                # Convert to readable format
                days = int(uptime_seconds // 86400)
                hours = int((uptime_seconds % 86400) // 3600)
                minutes = int((uptime_seconds % 3600) // 60)

                uptime_str = f"{days} days, {hours} hours, {minutes} minutes"
                boot_datetime = datetime.fromtimestamp(boot_time).isoformat()

                return f"System Uptime: {uptime_str}\nBoot Time: {boot_datetime}"

            except ImportError:
                return "Uptime monitoring requires 'psutil' package. Install with: pip install psutil"
            except Exception as e:
                return f"Error getting uptime: {str(e)}"