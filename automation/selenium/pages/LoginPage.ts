import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private emailInput = By.css('[data-testid="login_email"], input[type="email"]');
  private passwordInput = By.css('[data-testid="login_password"], input[type="password"]');
  private submitButton = By.css('[data-testid="login_submit"], [role="button"], button');

  constructor(driver: WebDriver) {
    super(driver);
  }

  async login(email: string, password: string): Promise<void> {
    await this.type(this.emailInput, email);
    await this.type(this.passwordInput, password);
    await this.click(this.submitButton);
  }

  async isLoginScreenDisplayed(): Promise<boolean> {
    return await this.isDisplayed(this.emailInput);
  }
}
