const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const outputDir = path.resolve(__dirname, '../screenshots/redesign');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 950 });

  // 1. Primary Dashboard
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outputDir, '01_primary_dashboard.png'), fullPage: false });
  console.log('Saved 01_primary_dashboard.png');

  // 2. Sensor Matrix ([F2])
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('[F2]') || text.includes('SENSOR MATRIX')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outputDir, '02_sensor_matrix.png'), fullPage: false });
  console.log('Saved 02_sensor_matrix.png');

  // 3. Mission & Route ([F3])
  const buttonsF3 = await page.$$('button');
  for (const btn of buttonsF3) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('[F3]') || text.includes('MISSION & ROUTE')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outputDir, '03_mission_route.png'), fullPage: false });
  console.log('Saved 03_mission_route.png');

  // 4. AI Predictions ([F4])
  const buttonsF4 = await page.$$('button');
  for (const btn of buttonsF4) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('[F4]') || text.includes('AI PREDICTIONS')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outputDir, '04_ai_predictions.png'), fullPage: false });
  console.log('Saved 04_ai_predictions.png');

  // 5. Fault Bench ([F5])
  const buttonsF5 = await page.$$('button');
  for (const btn of buttonsF5) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('[F5]') || text.includes('FAULT BENCH')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outputDir, '05_fault_bench.png'), fullPage: false });
  console.log('Saved 05_fault_bench.png');

  // 6. System Settings ([F6])
  const buttonsF6 = await page.$$('button');
  for (const btn of buttonsF6) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('[F6]') || text.includes('SYSTEM CONFIG')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outputDir, '06_system_settings.png'), fullPage: false });
  console.log('Saved 06_system_settings.png');

  // 7. Fault Injection Interlock Modal Open on Dashboard
  const buttonsF1 = await page.$$('button');
  for (const btn of buttonsF1) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('[F1]') || text.includes('PRIMARY DASHBOARD')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));
  // Click Fault Injection in header
  const headerFaultBtn = await page.$('button[title*="Fault"]');
  if (headerFaultBtn) {
    await headerFaultBtn.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(outputDir, '07_fault_modal.png'), fullPage: false });
    console.log('Saved 07_fault_modal.png');

    // Click Inject Motor 3 Degradation inside modal
    const modalButtons = await page.$$('button');
    for (const mBtn of modalButtons) {
      const text = await page.evaluate(el => el.textContent, mBtn);
      if (text.includes('INJECT') || text.includes('MOTOR 3')) {
        await mBtn.click();
        console.log('Injected Motor 3 fault');
        break;
      }
    }
    await new Promise(r => setTimeout(r, 800));

    // Close Modal
    const allBtns = await page.$$('button');
    for (const b of allBtns) {
      const t = await page.evaluate(el => el.textContent, b);
      if (t.includes('CLOSE') || t.includes('[X]')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1200));

    // 8. Capture Dashboard with Injected Fault (Showing dynamic RUL degradation)
    await page.screenshot({ path: path.join(outputDir, '08_fault_injected_dashboard.png'), fullPage: false });
    console.log('Saved 08_fault_injected_dashboard.png');
  }

  await browser.close();
})();
