#!/usr/bin/env python3
"""
MCPForge MCP Server
A comprehensive MCP server for learning and demonstrating MCP capabilities.
"""

from mcp.server.fastmcp import FastMCP
from .tools.file_manager import FileManager
from .tools.api_connector import APIConnector
from .tools.system_monitor import SystemMonitor
from .resources.file_resources import FileResources
from .prompts.code_templates import CodeTemplates

# Initialize FastMCP server
mcp = FastMCP("MCPForge")

# Initialize tool classes
file_manager = FileManager()
api_connector = APIConnector()
system_monitor = SystemMonitor()

# Initialize resources
file_resources = FileResources()

# Initialize prompts
code_templates = CodeTemplates()

# Register tools
file_manager.register_tools(mcp)
api_connector.register_tools(mcp)
system_monitor.register_tools(mcp)

# Register resources
file_resources.register_resources(mcp)

# Register prompts
code_templates.register_prompts(mcp)

def main():
    """Main entry point for the MCP server."""
    print("Starting MCPForge MCP Server...", file=__import__('sys').stderr)
    mcp.run(transport='stdio')

if __name__ == "__main__":
    main()