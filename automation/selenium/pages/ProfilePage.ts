import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  private editButton = By.css('[data-testid="profile_edit"], [aria-label="profile_edit"]');
  private saveButton = By.css('[data-testid="profile_save"], [aria-label="profile_save"]');
  private phoneInput = By.css('[data-testid="profile_phone_input"], [aria-label="profile_phone_input"], input');

  constructor(driver: WebDriver) {
    super(driver);
  }

  async editProfile(): Promise<void> {
    await this.click(this.editButton);
  }

  async updatePhoneNumber(phone: string): Promise<void> {
    await this.type(this.phoneInput, phone);
    await this.click(this.saveButton);
  }

  async isProfilePageLoaded(): Promise<boolean> {
    return await this.isDisplayed(this.editButton);
  }
}
