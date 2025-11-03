#!/usr/bin/env python3
"""
MCPForge Test Client
A simple client to test MCPForge server functionality.
"""

import asyncio
import json
import sys
from typing import Dict, Any, List
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

class MCPForgeTestClient:
    """Test client for MCPForge server."""

    def __init__(self, server_script: str):
        self.server_script = server_script

    async def test_tools(self) -> Dict[str, Any]:
        """Test all available tools."""
        results = {}

        # Create server parameters
        server_params = StdioServerParameters(
            command="python",
            args=[self.server_script],
            env=None
        )

        try:
            async with stdio_client(server_params) as (read, write):
                async with ClientSession(read, write) as session:
                    # Initialize the session
                    await session.initialize()

                    # List available tools
                    tools_response = await session.list_tools()
                    tools = tools_response.tools
                    results["available_tools"] = [tool.name for tool in tools]

                    # Test each tool with sample inputs
                    test_results = {}

                    for tool in tools:
                        try:
                            if tool.name == "list_directory":
                                result = await session.call_tool(tool.name, {"path": "."})
                                test_results[tool.name] = "SUCCESS"
                            elif tool.name == "get_system_info":
                                result = await session.call_tool(tool.name, {})
                                test_results[tool.name] = "SUCCESS"
                            elif tool.name == "http_get":
                                result = await session.call_tool(tool.name, {"url": "https://httpbin.org/get"})
                                test_results[tool.name] = "SUCCESS"
                            elif tool.name == "validate_url":
                                result = await session.call_tool(tool.name, {"url": "https://example.com"})
                                test_results[tool.name] = "SUCCESS"
                            else:
                                test_results[tool.name] = "NOT_TESTED"
                        except Exception as e:
                            test_results[tool.name] = f"ERROR: {str(e)}"

                    results["tool_tests"] = test_results

        except Exception as e:
            results["error"] = str(e)

        return results

    async def test_resources(self) -> Dict[str, Any]:
        """Test available resources."""
        results = {}

        server_params = StdioServerParameters(
            command="python",
            args=[self.server_script],
            env=None
        )

        try:
            async with stdio_client(server_params) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()

                    # List resources
                    resources_response = await session.list_resources()
                    resources = resources_response.resources
                    results["available_resources"] = [resource.uri for resource in resources]

                    # Test reading resources
                    resource_tests = {}
                    for resource in resources:
                        try:
                            content = await session.read_resource(resource.uri)
                            resource_tests[resource.uri] = "SUCCESS"
                        except Exception as e:
                            resource_tests[resource.uri] = f"ERROR: {str(e)}"

                    results["resource_tests"] = resource_tests

        except Exception as e:
            results["error"] = str(e)

        return results

    async def test_prompts(self) -> Dict[str, Any]:
        """Test available prompts."""
        results = {}

        server_params = StdioServerParameters(
            command="python",
            args=[self.server_script],
            env=None
        )

        try:
            async with stdio_client(server_params) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()

                    # List prompts
                    prompts_response = await session.list_prompts()
                    prompts = prompts_response.prompts
                    results["available_prompts"] = [prompt.name for prompt in prompts]

                    # Test getting prompts
                    prompt_tests = {}
                    for prompt in prompts:
                        try:
                            prompt_result = await session.get_prompt(prompt.name, {})
                            prompt_tests[prompt.name] = "SUCCESS"
                        except Exception as e:
                            prompt_tests[prompt.name] = f"ERROR: {str(e)}"

                    results["prompt_tests"] = prompt_tests

        except Exception as e:
            results["error"] = str(e)

        return results

async def main():
    """Main test function."""
    if len(sys.argv) != 2:
        print("Usage: python test_client.py <path_to_server_script>")
        sys.exit(1)

    server_script = sys.argv[1]
    client = MCPForgeTestClient(server_script)

    print("Testing MCPForge Server...")
    print("=" * 50)

    # Test tools
    print("Testing Tools:")
    tool_results = await client.test_tools()
    print(json.dumps(tool_results, indent=2))
    print()

    # Test resources
    print("Testing Resources:")
    resource_results = await client.test_resources()
    print(json.dumps(resource_results, indent=2))
    print()

    # Test prompts
    print("Testing Prompts:")
    prompt_results = await client.test_prompts()
    print(json.dumps(prompt_results, indent=2))
    print()

    print("Testing complete!")

if __name__ == "__main__":
    asyncio.run(main())