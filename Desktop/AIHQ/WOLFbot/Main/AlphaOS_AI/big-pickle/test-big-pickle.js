// Test script for Big Pickle LLM via OpenCode Zen
// Requires: OpenCode Zen API key

const API_ENDPOINT = 'https://opencode.ai/zen/v1/chat/completions';
const MODEL_ID = 'big-pickle';

async function testBigPickle(apiKey) {
  console.log('🥒 Testing Big Pickle LLM...');
  
  const testCases = [
    {
      name: 'Simple Coding Task',
      messages: [
        {
          role: 'user',
          content: 'Write a Python function that calculates the factorial of a number recursively.'
        }
      ]
    },
    {
      name: 'Code Analysis',
      messages: [
        {
          role: 'user',
          content: 'Analyze this JavaScript code for potential bugs:\n\nfunction findUser(id) {\n  return users.find(u => u.id === id);\n}\n\nconst user = findUser(123);\nconsole.log(user.name);'
        }
      ]
    },
    {
      name: 'Debugging Task',
      messages: [
        {
          role: 'user',
          content: 'I have this Python code that keeps throwing an IndexError. Can you help debug it?\n\narr = [1, 2, 3]\nfor i in range(4):\n    print(arr[i])'
        }
      ]
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Testing: ${testCase.name}`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: testCase.messages,
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (!response.ok) {
        console.error(`❌ Error: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      
      console.log(`✅ Success (${responseTime}ms)`);
      console.log(`📊 Tokens used: ${JSON.stringify(data.usage)}`);
      console.log(`💬 Response: ${data.choices[0].message.content.substring(0, 200)}...`);
      
    } catch (error) {
      console.error(`❌ Network error: ${error.message}`);
    }
  }
}

// Model info check
async function checkModelInfo(apiKey) {
  console.log('🔍 Checking model information...');
  
  try {
    const response = await fetch('https://opencode.ai/zen/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (response.ok) {
      const models = await response.json();
      const bigPickle = models.data.find(m => m.id === 'big-pickle');
      
      if (bigPickle) {
        console.log('✅ Big Pickle found in models list');
        console.log(`📋 Model info:`, bigPickle);
      } else {
        console.log('❌ Big Pickle not found in models list');
      }
    }
  } catch (error) {
    console.error(`❌ Error checking models: ${error.message}`);
  }
}

// Usage instructions
console.log(`
🥒 Big Pickle Test Script
========================

To use this script:

1. Get your OpenCode Zen API key from https://opencode.ai/auth
2. Set environment variable: export OPENCODE_ZEN_API_KEY="your-key-here"
3. Run: node test-big-pickle.js

Or modify the script to include your API key directly.

Note: OpenCode Zen requires a minimum $20 balance to access.
`);

// Run tests if API key is provided
const apiKey = process.env.OPENCODE_ZEN_API_KEY;

if (apiKey) {
  checkModelInfo(apiKey).then(() => {
    return testBigPickle(apiKey);
  });
} else {
  console.log('⚠️  No API key found. Please set OPENCODE_ZEN_API_KEY environment variable.');
}