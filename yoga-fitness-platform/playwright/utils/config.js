import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadTestData() {
  const raw = readFileSync(join(__dirname, '../fixtures/testData.json'), 'utf-8');
  return JSON.parse(raw);
}
