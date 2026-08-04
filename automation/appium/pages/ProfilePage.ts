import BasePage from './BasePage';

class ProfilePage extends BasePage {
  public async clickEdit() {
    await this.click('profile_edit');
  }

  public async updatePhone(phone: string) {
    await this.setValue('profile_phone_input', phone);
  }

  public async clickSave() {
    await this.click('profile_save');
  }

  public async clickLogout() {
    await this.click('logout_button');
  }

  public async isProfileScreenDisplayed(): Promise<boolean> {
    return this.isDisplayed('logout_button');
  }
}

export default new ProfilePage();
