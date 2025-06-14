import fs from 'fs';
import os from 'os';
import path from 'path';
import inquirer from 'inquirer';
import figlet from 'figlet';
import chalk from 'chalk';

const CONFIG_DIR = path.join(os.homedir(), '.cmitly');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export async function initConfig(logger) {
  logger.info(chalk.green(figlet.textSync('cmitly', { horizontalLayout: 'full' })));
  try {
    const answers = {};
    const { apiKey } = await inquirer.prompt({
      name: 'apiKey',
      type: 'input',
      message: "What's your API key?",
      validate: input => input ? true : 'API key cannot be empty'
    });
    answers.apiKey = apiKey;

    const { customUrl } = await inquirer.prompt({
      name: 'customUrl',
      type: 'confirm',
      message: 'Would you like to customize the base URL?',
      default: false
    });
    if (customUrl) {
      const { baseUrl } = await inquirer.prompt({
        name: 'baseUrl',
        type: 'input',
        message: 'Please enter your base URL:',
        default: 'https://api.openai.com/v1'
      });
      answers.baseUrl = baseUrl;
    } else {
      answers.baseUrl = 'https://api.openai.com/v1';
    }

    const { model } = await inquirer.prompt({
      name: 'model',
      type: 'input',
      message: 'Which model would you like to use? (default: gpt-4.1-mini):',
      default: 'gpt-4.1-mini'
    });
    answers.model = model;

    if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(answers, null, 2));
    logger.info('Cmitly initialized!');
  } catch (error) {
    logger.error('Failed to initialize configuration:', error);
    process.exit(2);
  }
}

export function ensureInitialized(logger) {
  if (!fs.existsSync(CONFIG_DIR) || !fs.readdirSync(CONFIG_DIR).length) {
    logger.error('Cmitly is not initialized. Run cmitly init to initialize Cmitly');
    process.exit(2);
  }
}

export function loadConfig(logger) {
  try {
    const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    logger.error('Failed to load config:', error);
    process.exit(2);
  }
}