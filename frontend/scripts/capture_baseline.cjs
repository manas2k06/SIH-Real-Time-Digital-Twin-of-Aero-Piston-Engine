const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const outputDir = path.resolve(__dirname, '../screenshots/baseline');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 950 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000)); // wait for 3D and canvas to render

  await page.screenshot({ path: path.join(outputDir, '01_dashboard_baseline.png'), fullPage: false });
  console.log('Baseline screenshot saved to', path.join(outputDir, '01_dashboard_baseline.png'));

  await browser.close();
})();
