import { WebDriver, By, until } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private landingExploreButton = By.css(
    '[data-testid="landing_explore_btn"], [aria-label="landing_explore_btn"]'
  );

  private emailInput = By.css(
    '[data-testid="login_email"], [aria-label="login_email"], input[type="email"]'
  );

  private passwordInput = By.css(
    '[data-testid="login_password"], [aria-label="login_password"], input[type="password"]'
  );

  private submitButton = By.css(
    '[data-testid="login_submit"], [aria-label="login_submit"]'
  );

  constructor(driver: WebDriver) {
    super(driver);
  }

  async openLoginScreen(): Promise<void> {
    const loginVisible = await this.isDisplayed(this.emailInput);

    if (loginVisible) {
      return;
    }

    const exploreVisible = await this.isDisplayed(
      this.landingExploreButton
    );

    if (exploreVisible) {
      await this.click(this.landingExploreButton);
    } else {
      const exploreByText = By.xpath(
        '//*[contains(normalize-space(.), "Explore Platform")]'
      );

      await this.driver.wait(
        until.elementLocated(exploreByText),
        15000,
        'Explore Platform button was not found on the landing page.'
      );

      await this.click(exploreByText);
    }

    const emailElement = await this.driver.wait(
      until.elementLocated(this.emailInput),
      15000,
      'Login email field did not appear after opening the login screen.'
    );

    await this.driver.wait(
      until.elementIsVisible(emailElement),
      15000
    );
  }

  async login(email: string, password: string): Promise<void> {
    await this.openLoginScreen();

    const emailElement = await this.driver.wait(
      until.elementLocated(this.emailInput),
      15000
    );

    const passwordElement = await this.driver.wait(
      until.elementLocated(this.passwordInput),
      15000
    );

    await emailElement.clear();
    await passwordElement.clear();

    await emailElement.sendKeys(email);
    await passwordElement.sendKeys(password);

    const submitElement = await this.driver.wait(
      until.elementLocated(this.submitButton),
      15000
    );

    await this.driver.wait(
      until.elementIsVisible(submitElement),
      15000
    );

    await submitElement.click();
  }

  async clearCredentials(): Promise<void> {
    const emailElement = await this.driver.wait(
      until.elementLocated(this.emailInput),
      15000
    );

    const passwordElement = await this.driver.wait(
      until.elementLocated(this.passwordInput),
      15000
    );

    await emailElement.clear();
    await passwordElement.clear();
  }

  async isLoginScreenDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.emailInput);
  }

  async isLandingPageDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.landingExploreButton);
  }
}