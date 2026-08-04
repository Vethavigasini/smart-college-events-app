import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class EventDetailPage extends BasePage {
  private registerButton = By.css('[data-testid="event_register"]');
  private cancelButton = By.css('[data-testid="event_cancel"]');
  private backButton = By.css('[data-testid="event_detail_back"]');

  constructor(driver: WebDriver) {
    super(driver);
  }

  async registerForEvent(): Promise<void> {
    await this.click(this.registerButton);
  }

  async cancelRegistration(): Promise<void> {
    await this.click(this.cancelButton);
  }

  async goBack(): Promise<void> {
    await this.click(this.backButton);
  }

  async isRegistrationButtonDisplayed(): Promise<boolean> {
    return await this.isDisplayed(this.registerButton);
  }

  async isCancellationButtonDisplayed(): Promise<boolean> {
    return await this.isDisplayed(this.cancelButton);
  }
}
