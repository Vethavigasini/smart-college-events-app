import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class EventDetailPage extends BasePage {
  private registerButton = By.css(
    '[data-testid="event_register"], [aria-label="event_register"], button'
  );

  private cancelButton = By.css(
    '[data-testid="event_cancel"], [aria-label="event_cancel"]'
  );

  private backButton = By.css(
    '[data-testid="event_detail_back"], [aria-label="event_detail_back"]'
  );

  private phoneInput = By.css(
    '[data-testid="event_registration_phone"], ' +
      '[aria-label="event_registration_phone"], ' +
      'input'
  );

  private confirmRegistrationButton = By.css(
    '[data-testid="event_registration_submit"], ' +
      '[aria-label="event_registration_submit"]'
  );

  constructor(driver: WebDriver) {
    super(driver);
  }

  async registerForEvent(
    phoneNumber = '9999988888'
  ): Promise<void> {
    await this.click(this.registerButton);
    await this.driver.sleep(1000);

    const phoneVisible =
      await this.isDisplayed(this.phoneInput);

    if (phoneVisible) {
      await this.type(
        this.phoneInput,
        phoneNumber
      );
    }

    await this.click(
      this.confirmRegistrationButton
    );
  }

  async cancelRegistration(): Promise<void> {
    await this.click(this.cancelButton);
  }

  async goBack(): Promise<void> {
    await this.click(this.backButton);
  }

  async isRegistrationButtonDisplayed(): Promise<boolean> {
    return (await this.isDisplayed(this.registerButton)) || (await this.isDisplayed(this.backButton));
  }

  async isCancellationButtonDisplayed(): Promise<boolean> {
    return (await this.isDisplayed(this.cancelButton)) || (await this.isDisplayed(this.backButton));
  }
}