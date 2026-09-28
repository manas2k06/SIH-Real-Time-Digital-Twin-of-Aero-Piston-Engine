import puppeteer from 'puppeteer';
import path from 'path';

async function capture() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050 });

  console.log('Navigating to http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Helper to click tab by text
  const clickTab = async (matchText) => {
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes(matchText)) {
        console.log(`Clicking tab: "${text.trim()}"`);
        await btn.click();
        await new Promise(r => setTimeout(r, 1500));
        return true;
      }
    }
    return false;
  };

  const artifactDir = 'C:\\Users\\Manas\\.gemini\\antigravity-ide\\brain\\4ce30062-6277-47dd-b9bb-9a3b2b4e8eb0';

  // 1. Click [F1] Engine Cockpit Twin
  await clickTab('Engine Cockpit Twin');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(artifactDir, 'rotax_f1_cockpit_twin.png') });
  console.log('Saved rotax_f1_cockpit_twin.png');

  // 2. Click [F2] Thermodynamics & Sensors (DetailedTelemetry page)
  await clickTab('Thermodynamics & Sensors');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(artifactDir, 'rotax_f2_telemetry_matrix.png') });
  console.log('Saved rotax_f2_telemetry_matrix.png');

  // 3. Scroll down on F2 to capture the 12-subsystem engineering matrix
  await page.evaluate(() => window.scrollBy(0, 850));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'rotax_f2_matrix_boxes.png') });
  console.log('Saved rotax_f2_matrix_boxes.png');

  // 4. Click [F4] LSTM & XGBoost RUL
  await clickTab('LSTM & XGBoost RUL');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(artifactDir, 'rotax_f4_rul_prognostics.png') });
  console.log('Saved rotax_f4_rul_prognostics.png');

  // 5. Click [F5] Fault Injection Interlock
  await clickTab('Fault Injection Interlock');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(artifactDir, 'rotax_f5_fault_testbench.png') });
  console.log('Saved rotax_f5_fault_testbench.png');

  await browser.close();
  console.log('All Rotax 914 F views successfully captured.');
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
