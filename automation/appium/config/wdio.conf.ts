import path from 'path';
import { androidCapabilities } from './capabilities';

export const config: any = {
  // Runner configuration
  runner: 'local',
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      project: path.join(__dirname, '../../tsconfig.json'),
      transpileOnly: true
    }
  },

  // Specs path
  specs: [
    '../tests/**/*.test.ts'
  ],
  exclude: [],

  // Capabilities
  maxInstances: parseInt(process.env.APPIUM_MAX_INSTANCES || '1'),
  capabilities: [androidCapabilities],

  // Port and Host
  logLevel: 'info',
  bail: 0,
  baseUrl: process.env.BACKEND_BASE_URL || 'http://localhost:5005',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  // Services
  services: [
    [
      'appium',
      {
        args: {
          address: process.env.APPIUM_HOST || '127.0.0.1',
          port: parseInt(process.env.APPIUM_PORT || '4723'),
          basePath: '/'
        },
        command: 'appium'
      }
    ]
  ],

  // Framework setup
  framework: 'mocha',
  reporters: [
    'spec',
    [
      'json',
      {
        outputDir: path.join(__dirname, '../reports'),
        outputFileFormat: function (opts: any) {
          return `results-${opts.cid}.json`;
        }
      }
    ]
  ],

  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
    retries: parseInt(process.env.TEST_RETRIES || '1')
  },

  // Lifecycle Hooks
  before: async function () {
    // Shared state configuration can be set up here
  },

  afterTest: async function (test: any, context: any, { error, result, duration, passed, retries }: any) {
    if (!passed) {
      const screenshotDir = path.join(__dirname, '../screenshots');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${test.title.replace(/\s+/g, '_')}_failed_${timestamp}.png`;
      const filepath = path.join(screenshotDir, filename);

      try {
        await (global as any).browser.saveScreenshot(filepath);
        console.log(`[Screenshot] Saved failure screenshot to: ${filepath}`);
      } catch (err) {
        console.error('[Screenshot] Failed to capture screenshot:', err);
      }
    }
  }
};
