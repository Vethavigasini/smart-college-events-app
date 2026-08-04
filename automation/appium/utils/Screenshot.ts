import path from 'path';
import fs from 'fs';

export class Screenshot {
  /**
   * Captures a screenshot and saves it to the appium screenshots directory
   * @param testName Name of the test for the filename prefix
   * @returns Absolute path to the saved screenshot file
   */
  public static async capture(testName: string): Promise<string> {
    const screenshotDir = path.join(__dirname, '../screenshots');
    
    // Ensure screenshots folder exists
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${testName.replace(/\s+/g, '_')}_${timestamp}.png`;
    const filepath = path.join(screenshotDir, filename);

    try {
      await browser.saveScreenshot(filepath);
      console.log(`[Screenshot] Screen captured successfully: ${filepath}`);
      return filepath;
    } catch (err) {
      console.error('[Screenshot] Error taking screenshot:', err);
      throw err;
    }
  }
}
