import { test, expect } from '@playwright/test';

// Test PDF direct browser viewing in Chrome
test.describe('PDF Browser Viewing Test - Chrome', () => {
  
  test('Open PDF directly in Chrome browser and capture screenshot', async ({ page }) => {
    console.log('Testing PDF direct viewing in Chrome browser...');
    
    const pdfFilePath = 'C:\\Temp\\PDFReports\\Tricentis_Insurance_Quote.pdf';
    const pdfUrl = `file:///${pdfFilePath.replace(/\\/g, '/')}`;
    
    try {
      console.log(`Opening PDF in Chrome: ${pdfUrl}`);
      
      // Navigate to the PDF in Chrome
      await page.goto(pdfUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(15000); // Wait for PDF to fully load
      
      // Take screenshot of the PDF opened in Chrome
      await page.screenshot({ 
        path: './screenshots/pdf-opened-in-chrome-browser.png',
        fullPage: true 
      });
      
      console.log('✓ PDF opened in Chrome browser and screenshot captured');
      
      // Try to get some text content to verify PDF is loaded
      const bodyText = await page.textContent('body').catch(() => null);
      console.log('PDF text length:', bodyText?.length || 0);
      
      if (bodyText && bodyText.length > 100) {
        console.log('✓ PDF content successfully loaded in Chrome');
        console.log('First 200 characters:', bodyText.substring(0, 200));
      } else {
        console.log('⚠ PDF might be displayed as viewer, not as text content');
      }
      
      // Check if Chrome PDF viewer is present
      const pdfViewer = await page.locator('embed[type="application/pdf"], object[type="application/pdf"], iframe').count();
      if (pdfViewer > 0) {
        console.log('✓ Chrome PDF viewer detected');
      }
      
    } catch (error) {
      console.error('Error opening PDF in Chrome:', error.message);
      
      // Take error screenshot
      await page.screenshot({ 
        path: './screenshots/pdf-chrome-error.png',
        fullPage: true 
      });
      
      throw error;
    }
  });
});