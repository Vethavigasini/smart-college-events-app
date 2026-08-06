declare const browser: any;

import BasePage from './BasePage';

class LoginPage extends BasePage {
  public async dismissCompatibilityDialog() {
    try {
      // Send Enter keycode (66) to dismiss the native dialog if present
      await browser.pressKeyCode(66);
      await this.pause(1000);
    } catch (err) {
      console.log('Failed to dismiss compatibility dialog:', err);
    }
  }

  public async login(email: string, pass: string) {
    await this.setValue('login_email', email);
    await this.setValue('login_password', pass);
    await this.click('login_submit');
  }

  public async useStudentDemo() {
    await this.click('demo_student');
    await this.click('login_submit');
  }

  public async useAdminDemo() {
    await this.click('demo_admin');
    await this.click('login_submit');
  }

  public async useFacultyDemo() {
    await this.click('demo_faculty');
    await this.click('login_submit');
  }

  public async clickSignUpLink() {
    await this.click('login_signup_link');
  }

  public async navigateToLoginScreen() {
    const isLanding = await this.isDisplayed('landing_explore_btn');
    if (isLanding) {
      await this.click('landing_explore_btn');
    }
  }

  public async isLoginScreenDisplayed(): Promise<boolean> {
    return this.isDisplayed('login_submit');
  }
}

export default new LoginPage();
