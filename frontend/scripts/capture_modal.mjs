import puppeteer from 'puppeteer';
import path from 'path';

async function testModal() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050 });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const artifactDir = 'C:\\Users\\Manas\\.gemini\\antigravity-ide\\brain\\4ce30062-6277-47dd-b9bb-9a3b2b4e8eb0';

  // Find the button with title or text containing "FAULT"
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && (text.includes('FAULT INJECTION') || text.includes('FAULTS'))) {
      console.log('Clicking fault modal trigger:', text);
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactDir, 'rotax_fault_modal_opened.png') });
  console.log('Saved rotax_fault_modal_opened.png');

  // Click COOLING category filter inside modal
  const modalButtons = await page.$$('button');
  for (const btn of modalButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.trim() === 'COOLING') {
      console.log('Clicking COOLING filter pill...');
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'rotax_fault_modal_cooling.png') });
  console.log('Saved rotax_fault_modal_cooling.png');

  await browser.close();
}

testModal().catch(err => {
  console.error(err);
  process.exit(1);
});
