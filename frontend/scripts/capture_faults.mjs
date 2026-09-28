import puppeteer from 'puppeteer';
import path from 'path';

async function testFaults() {
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

  const artifactDir = 'C:\\Users\\Manas\\.gemini\\antigravity-ide\\brain\\4ce30062-6277-47dd-b9bb-9a3b2b4e8eb0';

  // Helper to click button by text
  const clickButton = async (matchText) => {
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.toLowerCase().includes(matchText.toLowerCase())) {
        console.log(`Clicking button: "${text.trim()}"`);
        await btn.click();
        await new Promise(r => setTimeout(r, 1000));
        return true;
      }
    }
    return false;
  };

  // 1. Click Fault Injection Interlock tab (F5)
  await clickButton('Fault Injection Interlock');
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactDir, 'rotax_faults_testbench_all.png') });
  console.log('Saved rotax_faults_testbench_all.png');

  // 2. Click TURBO subsystem filter in Testbench
  await clickButton('TURBO & TCU');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'rotax_faults_testbench_turbo.png') });
  console.log('Saved rotax_faults_testbench_turbo.png');

  // 3. Inject TURBO_OVERBOOST by clicking the first "INJECT FAULT" button
  console.log('Triggering first INJECT FAULT button...');
  const injectBtns = await page.$$('button');
  for (const btn of injectBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.trim() === 'INJECT FAULT') {
      await btn.click();
      console.log('Clicked INJECT FAULT!');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(artifactDir, 'rotax_fault_active_testbench.png') });
  console.log('Saved rotax_fault_active_testbench.png');

  // 4. Return to Cockpit Twin to see visual reaction
  await clickButton('Engine Cockpit Twin');
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(artifactDir, 'rotax_cockpit_during_overboost.png') });
  console.log('Saved rotax_cockpit_during_overboost.png');

  // 5. Open Fault Injection Modal (header button with text FAULT INJECTION)
  const headerBtns = await page.$$('button');
  for (const btn of headerBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('FAULT INJECTION')) {
      await btn.click();
      console.log('Clicked header FAULT INJECTION button!');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactDir, 'rotax_fault_injection_modal.png') });
  console.log('Saved rotax_fault_injection_modal.png');

  await browser.close();
  console.log('Fault verification finished successfully.');
}

testFaults().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
