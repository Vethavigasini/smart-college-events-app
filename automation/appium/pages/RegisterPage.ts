import BasePage from './BasePage';

class RegisterPage extends BasePage {
  public async register(name: string, email: string, pass: string, confirmPass: string, role: 'student' | 'admin' | 'faculty', dept?: string) {
    await this.setValue('signup_name', name);
    await this.setValue('signup_email', email);
    await this.setValue('signup_password', pass);
    await this.setValue('signup_confirm_password', confirmPass);

    // Select role
    await this.click(`signup_role_${role}`);

    // Select department if provided and student/faculty selected
    if (dept) {
      const deptId = `signup_dept_${dept.toLowerCase().replace(/\s+/g, '_')}`;
      await this.click(deptId);
    }

    await this.click('signup_submit');
  }

  public async clickBack() {
    await this.click('signup_back_btn');
  }

  public async clickLoginLink() {
    await this.click('signup_login_link');
  }

  public async isRegisterScreenDisplayed(): Promise<boolean> {
    return this.isDisplayed('signup_submit');
  }
}

export default new RegisterPage();
