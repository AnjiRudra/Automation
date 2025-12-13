const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function generatePDF() {
  try {
    console.log('Installing pdfkit...');
    execSync('npm install pdfkit', { stdio: 'inherit' });
    
    console.log('Generating PDF from screenshots...');
    execSync('node generate-screenshot-pdf.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

generatePDF();
