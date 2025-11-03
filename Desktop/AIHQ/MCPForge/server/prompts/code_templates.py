"""
Code Templates for MCPForge
Provides prompt templates for code generation and assistance.
"""

from mcp.server.fastmcp import FastMCP

class CodeTemplates:
    """Manages code generation prompt templates."""

    def register_prompts(self, mcp: FastMCP) -> None:
        """Register all code templates with the MCP server."""

        @mcp.prompt()
        def generate_mcp_tool(language: str, tool_name: str, description: str) -> str:
            """Generate boilerplate code for a new MCP tool.

            Args:
                language: Programming language (python, typescript, etc.)
                tool_name: Name of the tool to generate
                description: What the tool should do
            """
            if language.lower() == "python":
                template = f'''@mcp.tool()
def {tool_name}(param: str) -> str:
    """{description}

    Args:
        param: Input parameter

    Returns:
        Tool result
    """
    # TODO: Implement tool logic
    return f"Processed: {{param}}"
'''
            elif language.lower() == "typescript":
                template = f'''server.tool(
  "{tool_name}",
  "{description}",
  {{
    param: z.string().describe("Input parameter")
  }},
  async ({{ param }}) => {{
    // TODO: Implement tool logic
    return {{
      content: [
        {{
          type: "text",
          text: `Processed: ${{param}}`
        }}
      ]
    }};
  }}
);'''
            else:
                template = f"// Code template for {tool_name} in {language}\n// {description}\n// TODO: Implement tool logic"

            return template

        @mcp.prompt()
        def debug_mcp_server() -> str:
            """Get debugging checklist for MCP server issues."""
            checklist = """# MCP Server Debugging Checklist

## 1. Server Startup Issues
- [ ] Check if all dependencies are installed
- [ ] Verify Python/Node.js version compatibility
- [ ] Ensure correct import paths
- [ ] Check for syntax errors in code

## 2. Claude Desktop Integration
- [ ] Verify claude_desktop_config.json syntax
- [ ] Check absolute paths in configuration
- [ ] Confirm server executable permissions
- [ ] Restart Claude Desktop completely

## 3. Tool Registration Problems
- [ ] Validate tool function signatures
- [ ] Check parameter types and descriptions
- [ ] Ensure unique tool names
- [ ] Verify tool decorators/registration

## 4. Communication Issues
- [ ] Check STDIO output (no print statements)
- [ ] Validate JSON-RPC message format
- [ ] Monitor server logs for errors
- [ ] Test tools independently

## 5. Resource Access Issues
- [ ] Verify file permissions
- [ ] Check resource URI formats
- [ ] Validate resource handlers
- [ ] Test resource reading

## Common Solutions
- Use logging instead of print statements
- Implement proper error handling
- Test with simple tools first
- Check official documentation"""
            return checklist

        @mcp.prompt()
        def create_mcp_project(language: str) -> str:
            """Generate project setup instructions for a new MCP project.

            Args:
                language: Programming language for the project
            """
            if language.lower() == "python":
                setup = """# Python MCP Project Setup

## 1. Create Project Structure
mkdir my-mcp-project
cd my-mcp-project

## 2. Initialize Python Project
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install mcp[cli] fastapi httpx pydantic

## 3. Create Basic Server
# server.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("MyServer")

@mcp.tool()
def hello_world(name: str) -> str:
    return f"Hello, {name}!"

if __name__ == "__main__":
    mcp.run()

## 4. Configure Claude Desktop
# Add to ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "my-server": {
      "command": "python",
      "args": ["/absolute/path/to/server.py"]
    }
  }
}

## 5. Test
python server.py"""
            else:
                setup = f"# MCP Project Setup for {language}\n# TODO: Add language-specific setup instructions"

            return setup