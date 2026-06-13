#!/usr/bin/env node
/**
 * Exporta diagramas HTML a PNG (requiere playwright una vez).
 * Uso: node docs/readme/diagrams/export-png.mjs
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const files = [
  '01-kit-overview.html',
  '02-quickstart-flow.html',
  '03-orchestrator.html',
  '04-ide-adapters.html',
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });

for (const file of files) {
  const htmlPath = path.join(__dirname, file);
  const pngPath = htmlPath.replace('.html', '.png');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const frame = page.locator('.frame');
  await frame.screenshot({ path: pngPath, type: 'png' });
  console.log('OK', path.basename(pngPath));
}

await browser.close();
