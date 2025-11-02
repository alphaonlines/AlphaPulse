# Wolfbot

This repository contains the Wolfbot project, which appears to be a setup for an AI assistant called "opencode" for software engineering tasks.

## Conversation Summary

The initial conversation involved setting up instructions for the opencode AI assistant, including safety guidelines, tool definitions, and operational rules. The main task was to analyze the codebase and create an AGENTS.md file with:

1. Build/lint/test commands, especially for running a single test
2. Code style guidelines (imports, formatting, types, naming, error handling)
3. Include Cursor rules (.cursor/rules/ or .cursorrules) or Copilot rules (.github/copilot-instructions.md) if present
4. Improve existing AGENTS.md if located in root

An AGENTS.md already exists in the AlphaOS_AI/ subdirectory, focused on testing the Big Pickle LLM model.

## Project Structure

- `AlphaOS_AI/`: Contains AI-related testing and documentation
  - `big-pickle/`: Tests for Big Pickle LLM model
  - `AGENTS.md`: Guidelines for agents in this subproject
- `opencode.json`: Configuration for opencode assistant

## Next Steps

- Analyze the full codebase for build/test commands and style guidelines
- Create or update AGENTS.md in root if needed
- Set up proper linting, testing, and build processes