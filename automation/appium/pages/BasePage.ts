declare const browser: any;
declare const $: any;

export default class BasePage {
  /**
   * Helper to select an element by accessibility identifier (testID / accessibilityLabel)
   */
  protected getElement(selector: string) {
    return $(`~${selector}`);
  }

  /**
   * Helper to wait for element visibility
   */
  public async waitForDisplayed(selector: string, timeout = 10000) {
    const el = await this.getElement(selector);
    await el.waitForDisplayed({ timeout });
    return el;
  }

  /**
   * Helper to click an element by accessibility ID
   */
  public async click(selector: string, timeout = 10000) {
    const el = await this.waitForDisplayed(selector, timeout);
    await el.click();
  }

  /**
   * Helper to send input text to a target field
   */
  public async setValue(selector: string, value: string, timeout = 10000) {
    const el = await this.waitForDisplayed(selector, timeout);
    await el.setValue(value);
  }

  /**
   * Helper to check if element is present
   */
  public async isDisplayed(selector: string, timeout = 5000): Promise<boolean> {
    try {
      const el = await this.getElement(selector);
      return await el.waitForDisplayed({ timeout });
    } catch {
      return false;
    }
  }

  /**
   * Wait for specific time duration
   */
  public async pause(ms: number) {
    await browser.pause(ms);
  }

  /**
   * Helper to dismiss native Alert dialogs
   */
  public async dismissAlert() {
    try {
      const okButton = await browser.$('android=new UiSelector().resourceId("android:id/button1")');
      if (await okButton.waitForDisplayed({ timeout: 5000 })) {
        await okButton.click();
        await browser.pause(1000);
      }
    } catch {
      // Ignore if alert is not present or timeout
    }
  }
}
