---
intent: "MCPForge MCP learning and development project"
owner: "Gemini"
authority: "Operator"
last_verified: "2025-11-02 19:45 UTC"
---
# 07_roe.md
Version: v1.0
Agents:
- Gemini: MCP development, documentation, testing
- WOLFbot: Approvals, architecture guidance
- Project lead: Technical decisions, implementation
Prohibited: Direct credential exposure, unsafe file operations, untested API calls
Escalation: Gemini → WOLFbot → Colonel

## Development Rules
- Follow MCP specification standards
- Implement proper error handling and logging
- Test all tools before integration
- Document all code and learning insights
- Use secure coding practices

## Testing Requirements
- Unit test all tools and functions
- Integration test with Claude Desktop
- Validate error handling scenarios
- Performance test under load

## Security Constraints
- No sensitive data in logs or documentation
- Validate all user inputs
- Implement proper access controls
- Follow OWASP security guidelines