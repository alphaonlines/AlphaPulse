# AGENTS.md

## Project Agents

### WOLFbot 🐺
- **Type**: Primary Agent
- **Role**: Documentation and Coordination Specialist
- **Location**: `.opencode/agent/wolfbot.md`
- **Purpose**: Maintains project scope, coordinates between agents, and ensures comprehensive documentation
- **Key Features**:
  - Scans all MD files on launch
  - Creates and maintains `todo-list.md` and `README.md` in every directory
  - Updates documentation after task completion
  - Monitors progress of other agents
  - Keeps project scope and objectives in memory
  - Facilitates effective collaboration between agents

### Big Pickle 🥒
- **Type**: Custom LLM Agent
- **Location**: `Main/AlphaOS_AI/big-pickle/`
- **Purpose**: Custom language model for specialized tasks
- **Testing**: `node AlphaOS_AI/big-pickle/test-big-pickle.js`

## Build/Lint/Test Commands
- **Run tests**: `node AlphaOS_AI/big-pickle/test-big-pickle.js` (requires OPENCODE_ZEN_API_KEY env var)
- **Single test**: Run the script directly; no specific single test command
- **No linting**: No linter configured
- **No build**: Pure JavaScript, no build process

## Code Style Guidelines
- **Language**: JavaScript (ES6+)
- **Imports**: Use ES6 import/export if needed (none in current files)
- **Formatting**: 2-space indentation, consistent spacing
- **Types**: No TypeScript; use JSDoc for documentation if needed
- **Naming**: camelCase for variables/functions, UPPER_SNAKE_CASE for constants
- **Error handling**: Try-catch blocks with descriptive console.error messages
- **Comments**: Brief comments at function/file top; use emojis in logs for clarity
- **Async**: Use async/await for promises
- **Environment**: Use process.env for API keys and config

## Agent Coordination
- **Primary Agent**: WOLFbot serves as the main coordination agent
- **Documentation**: All agents should coordinate with WOLFbot for documentation updates
- **Task Management**: WOLFbot maintains todo-list.md and tracks progress across all agents
- **Scope Management**: WOLFbot keeps the main project scope and ensures all agents work toward common goals

## Additional Rules
- No Cursor rules found (.cursor/rules/ or .cursorrules)
- No Copilot rules found (.github/copilot-instructions.md)