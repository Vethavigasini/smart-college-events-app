import BasePage from './BasePage';

class LoginPage extends BasePage {
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

  public async isLoginScreenDisplayed(): Promise<boolean> {
    return this.isDisplayed('login_submit');
  }
}

export default new LoginPage();
