# Big Pickle LLM Testing Notes

## Model Information
- **Model**: Big Pickle (`big-pickle`)
- **Provider**: OpenCode Zen (`opencode`)
- **Type**: Cloud-hosted LLM
- **Cost**: FREE
- **Context Window**: 200,000 tokens
- **Output Limit**: 128,000 tokens
- **Features**: Tool calling, Reasoning
- **Release**: January 2025
- **Last Updated**: October 17, 2025

## Access Details
- **API Endpoint**: `https://opencode.ai/zen/v1/chat/completions`
- **Model ID**: `opencode/big-pickle`
- **Authentication**: OpenCode Zen API key required
- **SDK**: OpenAI-compatible (`@ai-sdk/openai-compatible`)

## Testing Plan
### Phase 1: Basic Setup
- [x] Confirm Big Pickle availability in Zen models list
- [x] Create decision analysis for $20 investment requirement
- [x] Prepare test scripts and documentation
- [ ] Decide on investment approach (see decision-analysis.md)
- [ ] Get OpenCode Zen API key (requires $20 minimum balance) - OPTIONAL
- [ ] Test basic connectivity with Big Pickle - DEPENDS ON INVESTMENT
- [ ] Verify model capabilities and pricing - DEPENDS ON INVESTMENT

### Alternative Path: Free Models First
- [ ] Test Grok Code Fast 1 (confirmed free, 256K context)
- [ ] Test Code Supernova (free stealth model)
- [ ] Compare performance with requirements
- [ ] Decide if Big Pickle investment is justified

### Phase 2: Coding Tasks
- [ ] Test code generation
- [ ] Test code analysis
- [ ] Test debugging capabilities
- [ ] Test tool calling functionality

### Phase 3: Performance Evaluation
- [ ] Response speed testing
- [ ] Accuracy assessment
- [ ] Compare with other models
- [ ] Cost-benefit analysis

## Notes & Observations

### October 30, 2025 - Discovery Phase
- ✅ **CONFIRMED**: Big Pickle (`big-pickle`) is available in OpenCode Zen models list
- ✅ **API Endpoint**: `https://opencode.ai/zen/v1/chat/completions` (unified endpoint)
- ✅ **Model ID**: `opencode/big-pickle` (for OpenCode config)
- ❓ **Pricing**: Not listed in pricing table - possibly free or special pricing
- ⚠️ **Access**: Requires OpenCode Zen account with $20 minimum balance
- 🆕 **Other Models Found**: `an-gbt`, `minimax-m2` (not in docs)

### Next Steps
1. Need to decide if $20 investment is worth it for testing
2. Alternative: Consider Grok Code Fast 1 (confirmed free)
3. Could test Big Pickle through unified endpoint once API key obtained

*Add your testing notes here as we go...*

## Comparison with Alternatives
| Model | Cost | Context | Strengths | Weaknesses |
|-------|------|---------|-----------|-------------|
| Big Pickle | Unknown* | 200K | Available in Zen, large context | Requires $20 deposit, pricing unclear |
| Grok Code Fast 1 | FREE | 256K | Confirmed free, established | xAI data collection during free period |
| Code Supernova | FREE | Unknown | Free stealth model | Data collection during free period |
| Claude Haiku 4.5 | $1/1M | 200K | Proven performance | Cost |
| Qwen3 Coder | $0.45/1M | 262K | Good value | Less known |
| Llama 3 8B (Local) | FREE | 8K | Local execution, no API costs | Limited context, requires local hardware |

*Big Pickle pricing not listed in official pricing table - may be free or special pricing

## Decision Criteria
- [ ] Performance meets requirements
- [ ] Reliability is acceptable
- [ ] Data privacy concerns addressed
- [ ] Cost-effectiveness validated

## Files Created
- `big-pickle-testing.md` - This testing documentation
- `test-big-pickle.js` - Test script for API calls
- `big-pickle-decision-analysis.md` - Investment cost-benefit analysis

## Quick Start Options

### Option 1: Test Free Alternatives First (Recommended)
```bash
# No investment required
# Focus on Grok Code Fast 1 and Code Supernova
```

### Option 2: Invest in Big Pickle Testing
```bash
# 1. Sign up: https://opencode.ai/auth
# 2. Add $20 balance
# 3. Get API key
# 4. Set environment variable:
export OPENCODE_ZEN_API_KEY="your-key-here"
# 5. Run tests:
node test-big-pickle.js
```

### Option 3: Hybrid Approach
Test free alternatives first, then invest in Big Pickle if needed.

---
*Created: October 30, 2025*
*Last Updated: October 30, 2025*