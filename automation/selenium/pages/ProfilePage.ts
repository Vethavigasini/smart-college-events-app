import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  private editButton = By.css('[data-testid="profile_edit"]');
  private saveButton = By.css('[data-testid="profile_save"], [data-testid="profile_edit"]');
  private phoneInput = By.css('[data-testid="profile_phone_input"], input[keyboardtype="phone-pad"]');

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
