"""
API Connector Tools for MCPForge
Provides REST API interaction capabilities as MCP tools.
"""

import httpx
from typing import Dict, Any, Optional
from mcp.server.fastmcp import FastMCP

class APIConnector:
    """Manages API connections and requests as MCP tools."""

    def __init__(self):
        self.client = httpx.AsyncClient(
            timeout=30.0,
            headers={"User-Agent": "MCPForge-API-Connector/1.0"}
        )

    def register_tools(self, mcp: FastMCP) -> None:
        """Register all API connector tools with the MCP server."""

        @mcp.tool()
        async def http_get(url: str, headers: Optional[Dict[str, str]] = None) -> str:
            """Make an HTTP GET request to a URL.

            Args:
                url: The URL to request
                headers: Optional headers to include

            Returns:
                Response content or error message
            """
            try:
                # Basic URL validation
                if not url.startswith(('http://', 'https://')):
                    return "Error: URL must start with http:// or https://"

                request_headers = {}
                if headers:
                    request_headers.update(headers)

                response = await self.client.get(url, headers=request_headers)

                # Format response
                result = f"HTTP {response.status_code} {response.reason_phrase}\n"
                result += f"URL: {url}\n"
                result += f"Content-Type: {response.headers.get('content-type', 'unknown')}\n\n"

                # Try to get text content
                try:
                    content = response.text
                    # Truncate if too long
                    if len(content) > 5000:
                        content = content[:5000] + "\n... (truncated)"
                    result += content
                except Exception:
                    result += f"Binary content ({len(response.content)} bytes)"

                return result

            except Exception as e:
                return f"Error making HTTP request: {str(e)}"

        @mcp.tool()
        async def http_post(url: str, data: Optional[str] = None,
                           json_data: Optional[Dict[str, Any]] = None,
                           headers: Optional[Dict[str, str]] = None) -> str:
            """Make an HTTP POST request to a URL.

            Args:
                url: The URL to request
                data: Raw data to send
                json_data: JSON data to send
                headers: Optional headers to include

            Returns:
                Response content or error message
            """
            try:
                if not url.startswith(('http://', 'https://')):
                    return "Error: URL must start with http:// or https://"

                request_headers = {}
                if headers:
                    request_headers.update(headers)

                if json_data:
                    request_headers['Content-Type'] = 'application/json'
                    response = await self.client.post(url, json=json_data, headers=request_headers)
                elif data:
                    response = await self.client.post(url, content=data, headers=request_headers)
                else:
                    response = await self.client.post(url, headers=request_headers)

                result = f"HTTP {response.status_code} {response.reason_phrase}\n"
                result += f"URL: {url}\n\n"

                try:
                    content = response.text
                    if len(content) > 5000:
                        content = content[:5000] + "\n... (truncated)"
                    result += content
                except Exception:
                    result += f"Response content ({len(response.content)} bytes)"

                return result

            except Exception as e:
                return f"Error making HTTP POST request: {str(e)}"

        @mcp.tool()
        def validate_url(url: str) -> str:
            """Validate if a URL is properly formatted.

            Args:
                url: The URL to validate

            Returns:
                Validation result
            """
            try:
                from urllib.parse import urlparse

                parsed = urlparse(url)

                if not parsed.scheme or not parsed.netloc:
                    return f"Invalid URL format: {url}"

                if parsed.scheme not in ['http', 'https']:
                    return f"Unsupported scheme '{parsed.scheme}'. Use http or https."

                return f"Valid URL: {url}"

            except Exception as e:
                return f"Error validating URL: {str(e)}"

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()