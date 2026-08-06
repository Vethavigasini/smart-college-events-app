declare const browser: any;

import BasePage from './BasePage';

class ProfilePage extends BasePage {
  public async isProfileScreenDisplayed(): Promise<boolean> {
    const editButton = await browser.$('~profile_edit');
    const saveButton = await browser.$('~profile_save');

    const editVisible = await editButton
      .isDisplayed()
      .catch(() => false);

    const saveVisible = await saveButton
      .isDisplayed()
      .catch(() => false);

    return editVisible || saveVisible;
  }

  public async clickEdit() {
    const editButton = await browser.$('~profile_edit');

    await editButton.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Profile Edit button was not displayed.',
    });

    await editButton.click();
  }

  public async updatePhone(phone: string) {
    const phoneInput = await browser.$('~profile_phone_input');

    await phoneInput.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Profile phone input was not displayed.',
    });

    await phoneInput.clearValue();
    await phoneInput.setValue(phone);
  }

  public async clickSave() {
    const saveButton = await browser.$('~profile_save');

    await saveButton.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Profile Save button was not displayed.',
    });

    await saveButton.click();
  }

  public async clickLogout() {
    const logoutById = await browser.$('~profile_logout');

    if (
      await logoutById
        .isDisplayed()
        .catch(() => false)
    ) {
      await logoutById.click();
      return;
    }

    const logoutByText = await browser.$(
      'android=new UiSelector().textContains("Logout")'
    );

    if (
      await logoutByText
        .isDisplayed()
        .catch(() => false)
    ) {
      await logoutByText.click();
    }
  }
}

export default new ProfilePage();