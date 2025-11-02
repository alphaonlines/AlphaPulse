# OpenCode Guide

## Introduction

OpenCode is an open-source AI coding agent built for the terminal. It helps developers write, run, and manage code directly from the command line. With over 29,000 GitHub stars and 250,000 monthly users, it's trusted by developers worldwide. OpenCode emphasizes privacy by not storing code or context data, making it suitable for sensitive environments.

## Features

- **Native TUI**: A responsive, native, and themeable terminal user interface.
- **LSP Enabled**: Automatically loads the right Language Server Protocols (LSPs) for the LLM.
- **Multi-Session**: Start multiple agents in parallel on the same project.
- **Share Links**: Share a link to any session for reference or debugging.
- **Any Model**: Supports 75+ LLM providers through Models.dev, including local models.
- **Any Editor**: Runs in the terminal and pairs with any IDE.
- **Privacy First**: Does not store code or context data.
- **Zen**: Access to handpicked, optimized AI models tested for coding agents.
- **Built-in Agents**: Includes primary agents (Build, Plan) and subagents (General) for different tasks.
- **Customization**: Themes, keybinds, commands, formatters, and more.

## General Usage

### Installation
Install OpenCode using the install script:
```
curl -fsSL https://opencode.ai/install | bash
```
Other methods include npm, bun, pnpm, yarn, Homebrew, Paru, Chocolatey, or Scoop.

### Configuration
Configure LLM providers by setting API keys. Use `opencode auth login` to add credentials. Recommended for beginners: OpenCode Zen at https://opencode.ai/auth.

### Initialization
Navigate to your project directory and run:
```
cd /path/to/project
opencode
/init
```
This analyzes the project and creates an `AGENTS.md` file. Commit this file to Git.

### Basic Usage
- **Ask Questions**: Query the codebase, e.g., "How is authentication handled in @packages/functions/src/api/index.ts"
- **Add Features**: Use Plan mode (Tab key) to review plans before building. Switch back to Build mode to implement.
- **Make Changes**: Directly request changes, e.g., "Add authentication to the /settings route."
- **Undo Changes**: Use `/undo` to revert; `/redo` to reapply.
- **Share Sessions**: Run `/share` to create a shareable link.

### Customization
Customize themes, keybinds, commands, formatters, and more via config files.

## Creating Agents Using Best Practices

Agents are specialized AI assistants for specific tasks. Use them to create focused tools with custom prompts, models, and tool access.

### Types of Agents
- **Primary Agents**: Main assistants interacted with directly. Switch using Tab key. Examples: Build (full access), Plan (restricted for analysis).
- **Subagents**: Specialized assistants invoked by primary agents or manually with @mention. Example: General (for research and multi-step tasks).

### Built-in Agents
- **Build**: Default primary agent with all tools enabled for development.
- **Plan**: Restricted primary agent for planning (edits and bash set to "ask").
- **General**: Subagent for complex research and searches.

### Configuration
Configure agents in `opencode.json` (JSON) or markdown files in `~/.config/opencode/agent/` (global) or `.opencode/agent/` (project-specific).

#### JSON Example
```json
{
  "$schema": "https://opencode.ai/config.json",
  "agent": {
    "code-reviewer": {
      "description": "Reviews code for best practices and potential issues",
      "mode": "subagent",
      "model": "anthropic/claude-sonnet-4-20250514",
      "prompt": "You are a code reviewer. Focus on security, performance, and maintainability.",
      "tools": {
        "write": false,
        "edit": false
      }
    }
  }
}
```

#### Markdown Example
```
---
description: Reviews code for quality and best practices
mode: subagent
model: anthropic/claude-sonnet-4-20250514
temperature: 0.1
tools:
  write: false
  edit: false
  bash: false
---
You are in code review mode. Focus on:
- Code quality and best practices
- Potential bugs and edge cases
- Performance implications
- Security considerations
Provide constructive feedback without making direct changes.
```

### Options
- **Description**: Required brief description of the agent's purpose.
- **Temperature**: Controls randomness (0.0-1.0); lower for focused tasks.
- **Disable**: Set to true to disable the agent.
- **Prompt**: Custom system prompt file path.
- **Model**: Override default model.
- **Tools**: Enable/disable specific tools (e.g., write, edit, bash).
- **Permissions**: Control actions (ask, allow, deny) for edit, bash, webfetch.
- **Mode**: primary, subagent, or all.
- **Additional**: Pass provider-specific options.

### Creating Agents
Use `opencode agent create` for an interactive setup that generates a markdown file.

### Best Practices
- **Use Descriptions**: Clearly describe when and how to use the agent.
- **Set Appropriate Tools/Permissions**: Limit tools for safety (e.g., read-only for reviewers).
- **Leverage Subagents**: Use for specialized tasks like code review or security audits.
- **Customize Prompts**: Tailor prompts for specific workflows.
- **Test Configurations**: Ensure agents behave as expected in different scenarios.
- **Organize**: Use global configs for reusable agents, project-specific for tailored ones.

### Use Cases
- **Build Agent**: Full development with all tools.
- **Plan Agent**: Analysis without changes.
- **Review Agent**: Code review with read-only access.
- **Debug Agent**: Investigation with bash and read tools.
- **Docs Agent**: Documentation writing without system commands.

### Examples
#### Documentation Agent
```
---
description: Writes and maintains project documentation
mode: subagent
tools:
  bash: false
---
You are a technical writer. Create clear, comprehensive documentation.
Focus on:
- Clear explanations
- Proper structure
- Code examples
- User-friendly language
```

#### Security Auditor
```
---
description: Performs security audits and identifies vulnerabilities
mode: subagent
tools:
  write: false
  edit: false
---
You are a security expert. Focus on identifying potential security issues.
Look for:
- Input validation vulnerabilities
- Authentication and authorization flaws
- Data exposure risks
- Dependency vulnerabilities
- Configuration security issues
```