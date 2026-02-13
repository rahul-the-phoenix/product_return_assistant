#!/usr/bin/env node

// Simple verification script to check if all files are in place

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying AI Returns Assistant Setup...\n');

const requiredFiles = [
    'server.js',
    'package.json',
    '.env.example',
    'README.md',
    'SETUP.md',
    'public/index.html',
    'public/style.css',
    'public/script.js',
    'data/orders.json',
    'data/policies.json',
    'data/returns.json',
    'utils/scaledown.js'
];

let allGood = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING!`);
        allGood = false;
    }
});

console.log('\n' + '='.repeat(50));

if (allGood) {
    console.log('✅ All files present! Setup is complete.');
    console.log('\nNext steps:');
    console.log('1. Run: npm install');
    console.log('2. Copy .env.example to .env and add your ScaleDown API key');
    console.log('3. Run: npm start');
    console.log('4. Open: http://localhost:3000');
} else {
    console.log('❌ Some files are missing. Please check the setup.');
}

console.log('='.repeat(50) + '\n');
