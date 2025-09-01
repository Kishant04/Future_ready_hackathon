// Test script for the Enhanced AI Documentation Generator Backend
// Run this after starting the enhanced backend server

const BASE_URL = 'http://localhost:5002';

// Test data
const testGithubUrl = 'https://github.com/facebook/react';

async function testEnhancedBackend() {
  console.log('🧪 Testing Enhanced AI Documentation Generator Backend\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
    console.log('');

    // Test 2: Generate Documentation
    console.log('2️⃣ Testing Documentation Generation...');
    console.log(`📝 Generating docs for: ${testGithubUrl}`);
    
    const generateResponse = await fetch(`${BASE_URL}/generate-docs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ githubUrl: testGithubUrl }),
    });

    if (generateResponse.ok) {
      const generateData = await generateResponse.json();
      console.log('✅ Documentation Generated Successfully!');
      console.log('📊 Repository:', generateData.data.repoInfo.fullName);
      console.log('🕒 Generated at:', generateData.data.generatedAt);
      console.log('📁 Saved to:', `server/generated_docs/${generateData.data.repoInfo.owner}_${generateData.data.repoInfo.repo}_docs.json`);
      console.log('');
      
      // Test 3: Retrieve Generated Documentation
      console.log('3️⃣ Testing Documentation Retrieval...');
      const { owner, repo } = generateData.data.repoInfo;
      
      const retrieveResponse = await fetch(`${BASE_URL}/get-docs/${owner}/${repo}`);
      if (retrieveResponse.ok) {
        const retrieveData = await retrieveResponse.json();
        console.log('✅ Documentation Retrieved Successfully!');
        console.log('📋 Available sections:');
        Object.keys(retrieveData.data.documentation).forEach(section => {
          console.log(`   - ${section}`);
        });
      } else {
        console.log('❌ Failed to retrieve documentation');
      }
      console.log('');

      // Test 4: List All Documentation
      console.log('4️⃣ Testing Documentation Listing...');
      const listResponse = await fetch(`${BASE_URL}/list-docs`);
      if (listResponse.ok) {
        const listData = await listResponse.json();
        console.log('✅ Documentation List Retrieved!');
        console.log(`📚 Total documents: ${listData.count}`);
        listData.documents.forEach(doc => {
          console.log(`   - ${doc.owner}/${doc.repo}`);
        });
      } else {
        console.log('❌ Failed to list documentation');
      }

    } else {
      const errorData = await generateResponse.json();
      console.log('❌ Documentation Generation Failed:', errorData.error);
      
      if (errorData.code === 'AI_UNAVAILABLE') {
        console.log('💡 Tip: Check your GOOGLE_API_KEY in the .env file');
      }
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('💡 Make sure the enhanced backend server is running on port 5002');
  }
}

// Test with a different repository
async function testWithCustomRepo(githubUrl) {
  console.log(`\n🧪 Testing with custom repository: ${githubUrl}`);
  
  try {
    const response = await fetch(`${BASE_URL}/generate-docs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ githubUrl }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Documentation generated for:', data.data.repoInfo.fullName);
      console.log('📁 Saved to:', `server/generated_docs/${data.data.repoInfo.owner}_${data.data.repoInfo.repo}_docs.json`);
    } else {
      const errorData = await response.json();
      console.log('❌ Failed:', errorData.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run tests
console.log('🚀 Starting Enhanced Backend Tests...\n');
testEnhancedBackend();

// Uncomment to test with a different repository
// testWithCustomRepo('https://github.com/vercel/next.js');

console.log('\n📖 Check the server/generated_docs/ directory for saved documentation files');
console.log('📖 Check the server/extracted_repos/ directory for cached repository data');
