#!/usr/bin/env node
/**
 * Fix JSON encoding issues - Strip BOM and convert to UTF-8
 */
const fs = require('fs');
const path = require('path');

const files = ['en-US.json', 'zh-Hans.json'];

console.log('🔧 Starting JSON encoding fix...\n');

files.forEach(filename => {
  const filePath = path.join(__dirname, filename);
  
  try {
    console.log(`📄 Processing: ${filename}`);
    
    // Read file as buffer to detect encoding issues
    const buffer = fs.readFileSync(filePath);
    
    // Check for BOM
    let content;
    if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      console.log('   ⚠️  Found UTF-8 BOM, removing...');
      content = buffer.slice(3).toString('utf8');
    } else if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
      console.log('   ⚠️  Found UTF-16LE BOM, converting to UTF-8...');
      content = buffer.toString('utf16le').slice(1); // Remove BOM character
    } else if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
      console.log('   ⚠️  Found UTF-16BE BOM, converting to UTF-8...');
      content = buffer.toString('utf16be').slice(1); // Remove BOM character
    } else {
      // Try to read as UTF-8
      content = buffer.toString('utf8');
    }
    
    // Validate JSON
    console.log('   🔍 Validating JSON structure...');
    const parsed = JSON.parse(content);
    console.log(`   ✅ Valid JSON with ${Object.keys(parsed).length} top-level keys`);
    
    // Write back as clean UTF-8 without BOM
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
    console.log(`   💾 Saved as clean UTF-8 without BOM\n`);
    
  } catch (error) {
    console.error(`   ❌ Error processing ${filename}:`, error.message);
    console.error(`   Stack: ${error.stack}\n`);
  }
});

console.log('✨ JSON encoding fix complete!\n');
console.log('🧪 Running validation test...\n');

// Final validation test
files.forEach(filename => {
  try {
    const content = fs.readFileSync(path.join(__dirname, filename), 'utf8');
    const parsed = JSON.parse(content);
    console.log(`✅ ${filename}: Successfully parsed, ${Object.keys(parsed).length} keys`);
    
    // Check for items array
    if (parsed.items) {
      console.log(`   📦 Found ${parsed.items.length} items`);
    }
    if (parsed.recipes) {
      console.log(`   📝 Found ${parsed.recipes.length} recipes`);
    }
  } catch (error) {
    console.error(`❌ ${filename}: Still has issues - ${error.message}`);
  }
});

console.log('\n🎉 All done! generateStaticParams() should work now.');
