# MCP Learning Notes

## MCP Protocol Fundamentals

### What is MCP?
- Model Context Protocol - standardized way for AI models to connect to external systems
- Enables AI applications to access tools, data sources, and workflows
- Like USB-C for AI applications

### Core Components
- **Servers**: Provide capabilities (tools, resources, prompts)
- **Clients**: Consume capabilities (Claude Desktop, custom apps)
- **Transport**: Communication layer (STDIO, HTTP, WebSocket)

### MCP Capabilities
1. **Tools**: Executable functions that AI can call
2. **Resources**: File-like data that AI can read
3. **Prompts**: Pre-written templates for specific tasks

## FastMCP Framework

### Key Features
- Python-first MCP server framework
- Automatic tool registration from type hints
- Built-in error handling and logging
- STDIO transport support

### Basic Server Structure
```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("server_name")

@mcp.tool()
def my_tool(param: str) -> str:
    return f"Processed: {param}"

if __name__ == "__main__":
    mcp.run()
```

## Implementation Patterns

### Tool Development
- Use descriptive names and docstrings
- Validate inputs thoroughly
- Handle errors gracefully
- Return structured data

### Resource Management
- Implement read operations
- Handle file permissions
- Support different data formats
- Cache when appropriate

### Prompt Templates
- Create reusable templates
- Include context variables
- Support different use cases
- Document usage patterns

## Claude Desktop Integration

### Configuration
- Use `claude_desktop_config.json`
- Specify command and arguments
- Set absolute paths
- Restart Claude after changes

### Testing
- Check MCP tools slider
- Verify tool availability
- Test tool execution
- Monitor logs for errors

## Best Practices Learned

### Development
- Start with simple tools
- Test incrementally
- Document everything
- Use proper logging

### Security
- Validate all inputs
- Handle sensitive data carefully
- Implement access controls
- Follow least privilege principle

### Performance
- Optimize resource usage
- Cache when possible
- Handle concurrent requests
- Monitor memory usage

## Challenges and Solutions

### Common Issues
- JSON-RPC communication errors
- Tool parameter validation
- Resource access permissions
- Claude Desktop configuration

### Debugging Approaches
- Check server logs
- Validate JSON-RPC messages
- Test tools independently
- Use Claude Desktop logs

## Future Learning Goals
- Advanced tool chaining
- Custom transport protocols
- Multi-language servers
- Enterprise integrations