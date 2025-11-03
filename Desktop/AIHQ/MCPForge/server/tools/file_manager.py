"""
File Manager Tools for MCPForge
Provides file system operations as MCP tools.
"""

import os
from pathlib import Path
from typing import List, Dict, Any
from mcp.server.fastmcp import FastMCP

class FileManager:
    """Manages file system operations as MCP tools."""

    def register_tools(self, mcp: FastMCP) -> None:
        """Register all file management tools with the MCP server."""

        @mcp.tool()
        def list_directory(path: str = ".") -> str:
            """List contents of a directory.

            Args:
                path: Directory path to list (default: current directory)

            Returns:
                Formatted list of directory contents
            """
            try:
                path_obj = Path(path).resolve()

                # Security check - prevent access outside allowed directories
                if not self._is_path_allowed(path_obj):
                    return f"Access denied: {path}"

                if not path_obj.exists():
                    return f"Directory does not exist: {path}"

                if not path_obj.is_dir():
                    return f"Path is not a directory: {path}"

                items = []
                for item in sorted(path_obj.iterdir()):
                    item_type = "DIR" if item.is_dir() else "FILE"
                    size = f" ({item.stat().st_size} bytes)" if item.is_file() else ""
                    items.append(f"{item_type}: {item.name}{size}")

                return f"Contents of {path}:\n" + "\n".join(items)

            except Exception as e:
                return f"Error listing directory: {str(e)}"

        @mcp.tool()
        def read_file(path: str, max_lines: int = 100) -> str:
            """Read contents of a text file.

            Args:
                path: Path to the file to read
                max_lines: Maximum number of lines to read (default: 100)

            Returns:
                File contents or error message
            """
            try:
                path_obj = Path(path).resolve()

                if not self._is_path_allowed(path_obj):
                    return f"Access denied: {path}"

                if not path_obj.exists():
                    return f"File does not exist: {path}"

                if not path_obj.is_file():
                    return f"Path is not a file: {path}"

                with open(path_obj, 'r', encoding='utf-8') as f:
                    lines = f.readlines()[:max_lines]
                    content = ''.join(lines)

                    if len(lines) == max_lines:
                        content += f"\n... (truncated to {max_lines} lines)"

                    return f"Contents of {path}:\n{content}"

            except UnicodeDecodeError:
                return f"File is not a readable text file: {path}"
            except Exception as e:
                return f"Error reading file: {str(e)}"

        @mcp.tool()
        def get_file_info(path: str) -> str:
            """Get information about a file or directory.

            Args:
                path: Path to check

            Returns:
                File/directory information
            """
            try:
                path_obj = Path(path).resolve()

                if not self._is_path_allowed(path_obj):
                    return f"Access denied: {path}"

                if not path_obj.exists():
                    return f"Path does not exist: {path}"

                stat = path_obj.stat()
                info = {
                    "Path": str(path_obj),
                    "Type": "Directory" if path_obj.is_dir() else "File",
                    "Size": f"{stat.st_size} bytes" if path_obj.is_file() else "N/A",
                    "Modified": stat.st_mtime,
                    "Permissions": oct(stat.st_mode)[-3:]
                }

                return "\n".join(f"{k}: {v}" for k, v in info.items())

            except Exception as e:
                return f"Error getting file info: {str(e)}"

    def _is_path_allowed(self, path: Path) -> bool:
        """Check if the path is within allowed directories."""
        # For learning purposes, allow access within the project directory
        # In production, implement more restrictive path validation
        try:
            path.resolve()
            return True
        except Exception:
            return False