import { WebDriver, By, until, WebElement } from 'selenium-webdriver';

export class BasePage {
  protected driver: WebDriver;
  protected timeout = 15000;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  protected async getElement(locator: By): Promise<WebElement> {
    await this.driver.wait(until.elementLocated(locator), this.timeout);
    const element = await this.driver.findElement(locator);
    await this.driver.wait(until.elementIsVisible(element), this.timeout);
    return element;
  }

  protected async click(locator: By): Promise<void> {
    const element = await this.getElement(locator);
    await this.driver.wait(until.elementIsEnabled(element), this.timeout);
    await element.click();
  }

  protected async type(locator: By, text: string): Promise<void> {
    const element = await this.getElement(locator);
    await element.clear();
    await element.sendKeys(text);
  }

  protected async getText(locator: By): Promise<string> {
    const element = await this.getElement(locator);
    return await element.getText();
  }

  protected async isDisplayed(locator: By): Promise<boolean> {
    try {
      const element = await this.driver.findElement(locator);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }
}
