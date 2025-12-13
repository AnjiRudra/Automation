const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Create screenshots folder if it doesn't exist
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Get all PNG files from screenshots directory
const screenshotFiles = fs.readdirSync(screenshotsDir)
  .filter(file => file.endsWith('.png'))
  .sort();

if (screenshotFiles.length === 0) {
  console.log('No screenshots found in ./screenshots folder');
  process.exit(1);
}

console.log(`Found ${screenshotFiles.length} screenshots. Creating PDF...`);

// Create a PDF document
const doc = new PDFDocument({
  size: 'A4',
  margin: 10
});

// Output file
const outputPath = path.join(__dirname, 'test-screenshots.pdf');
const writeStream = fs.createWriteStream(outputPath);

doc.pipe(writeStream);

// Add title
doc.fontSize(20).font('Helvetica-Bold').text('Test Execution Screenshots', 50, 50);
doc.moveDown();
doc.fontSize(12).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, 50, 100);
doc.moveDown(2);

// Add each screenshot
let pageCount = 1;
screenshotFiles.forEach((file, index) => {
  const filePath = path.join(screenshotsDir, file);
  const stats = fs.statSync(filePath);
  
  // Add new page for each image (except the first one which uses the title page)
  if (index > 0) {
    doc.addPage();
  }
  
  // Add screenshot title
  doc.fontSize(14).font('Helvetica-Bold').text(`Step ${index + 1}: ${file}`, 50, 50);
  
  // Add the image
  doc.image(filePath, 50, 100, { width: 500, height: 600 });
  
  console.log(`Added screenshot ${index + 1}/${screenshotFiles.length}: ${file}`);
});

// Finalize PDF
doc.end();

writeStream.on('finish', () => {
  console.log(`\n✅ PDF created successfully: ${outputPath}`);
  console.log(`Total pages: ${screenshotFiles.length + 1}`);
});

writeStream.on('error', (err) => {
  console.error('Error creating PDF:', err);
  process.exit(1);
});

doc.on('error', (err) => {
  console.error('Error writing PDF:', err);
  process.exit(1);
});
