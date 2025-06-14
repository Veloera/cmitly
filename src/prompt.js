import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function loadSystemPrompt(logger) {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    let systemPrompt = fs.readFileSync(path.join(__dirname, '../bin/system_prompt.txt'), 'utf-8');
    const locale = process.env.LOCALE || process.env.LANG || 'en';
    systemPrompt = systemPrompt.replace('{locale}', locale);
    return systemPrompt;
  } catch (error) {
    logger.error('Failed to load system prompt:', error);
    process.exit(5);
  }
}