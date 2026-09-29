import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureAll() {
  const outputDir = path.resolve(__dirname, '../screenshots/redesign');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Launching browser with Edge and WebGL enabled...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--window-size=1600,1050',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });

  console.log('Navigating to http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2500));

  // Helper to click tab by text
  const clickTab = async (matchText) => {
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes(matchText)) {
        console.log(`Clicking tab: "${text.trim()}"`);
        await btn.click();
        await new Promise((r) => setTimeout(r, 1800));
        return true;
      }
    }
    console.warn(`Tab not found with text: "${matchText}"`);
    return false;
  };

  // 1. Primary Dashboard ([F1] Engine Cockpit Twin)
  console.log('1. Capturing Primary Dashboard...');
  await clickTab('Engine Cockpit Twin');
  await new Promise((r) => setTimeout(r, 2500));
  await page.screenshot({
    path: path.join(outputDir, '01_primary_dashboard.png'),
    fullPage: false,
  });
  console.log('✓ Saved 01_primary_dashboard.png');

  // 2. Sensor Matrix ([F2] Thermodynamics & Sensors)
  console.log('2. Capturing Sensor Matrix...');
  await clickTab('Thermodynamics & Sensors');
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(outputDir, '02_sensor_matrix.png'),
    fullPage: false,
  });
  console.log('✓ Saved 02_sensor_matrix.png');

  // 3. Mission & Route ([F3] MALE-UAV Mission Replay)
  console.log('3. Capturing Mission & Route...');
  await clickTab('MALE-UAV Mission Replay');
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(outputDir, '03_mission_route.png'),
    fullPage: false,
  });
  console.log('✓ Saved 03_mission_route.png');

  // 4. AI Predictions ([F4] LSTM & XGBoost RUL)
  console.log('4. Capturing AI Predictions...');
  await clickTab('LSTM & XGBoost RUL');
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(outputDir, '04_ai_predictions.png'),
    fullPage: false,
  });
  console.log('✓ Saved 04_ai_predictions.png');

  // 5. Fault Bench ([F5] Fault Injection Interlock)
  console.log('5. Capturing Fault Bench...');
  await clickTab('Fault Injection Interlock');
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(outputDir, '05_fault_bench.png'),
    fullPage: false,
  });
  console.log('✓ Saved 05_fault_bench.png');

  // 6. System Settings ([F6] System Settings)
  console.log('6. Capturing System Settings...');
  await clickTab('System Settings');
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(outputDir, '06_system_settings.png'),
    fullPage: false,
  });
  console.log('✓ Saved 06_system_settings.png');

  // 7. Fault Modal on Cockpit Twin
  console.log('7. Capturing Fault Injection Modal...');
  await clickTab('Engine Cockpit Twin');
  await new Promise((r) => setTimeout(r, 1500));

  // Find header button with FAULT INJECTION
  const headerBtns = await page.$$('button');
  let openedModal = false;
  for (const btn of headerBtns) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes('FAULT INJECTION')) {
      console.log('Opening Fault Injection modal...');
      await btn.click();
      openedModal = true;
      break;
    }
  }

  if (openedModal) {
    await new Promise((r) => setTimeout(r, 1800));
    await page.screenshot({
      path: path.join(outputDir, '07_fault_modal.png'),
      fullPage: false,
    });
    console.log('✓ Saved 07_fault_modal.png');

    // 8. Inject a fault and capture Fault-Injected Dashboard
    console.log('8. Injecting fault and capturing Active Alert Dashboard...');
    const modalButtons = await page.$$('button');
    for (const mBtn of modalButtons) {
      const text = await page.evaluate((el) => el.textContent, mBtn);
      if (text && text.trim() === 'INJECT') {
        console.log('Clicking INJECT for fault...');
        await mBtn.click();
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 1200));

    // Close modal by clicking CONFIRM & CLOSE
    const closeBtns = await page.$$('button');
    for (const cBtn of closeBtns) {
      const text = await page.evaluate((el) => el.textContent, cBtn);
      if (text && (text.includes('CONFIRM & CLOSE') || text.includes('CLOSE'))) {
        console.log('Closing modal...');
        await cBtn.click();
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 2500));

    // Capture the Cockpit Twin with active injected fault alert banner & telemetry reaction
    await page.screenshot({
      path: path.join(outputDir, '08_fault_injected_dashboard.png'),
      fullPage: false,
    });
    console.log('✓ Saved 08_fault_injected_dashboard.png');
  }

  await browser.close();
  console.log('🎉 All 8 updated screenshots captured and saved to frontend/screenshots/redesign!');
}

captureAll().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
