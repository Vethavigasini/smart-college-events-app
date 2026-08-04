declare const browser: any;

import BasePage from './BasePage';

class EventDetailPage extends BasePage {
  public async clickRegister() {
    await this.click('event_register');
  }

  public async fillRegistrationPhone(phone: string) {
    await this.setValue('event_registration_phone', phone);
  }

  public async submitRegistration() {
    await this.click('event_registration_submit');
    await this.dismissAlert();
  }

  public async clickCancelRegistration() {
    const cancelButton = await browser.$('~event_cancel');

    await cancelButton.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Cancel registration button was not displayed.',
    });

    await cancelButton.click();
    await browser.pause(1000);

    // Android native confirmation dialog
    const androidConfirmButton = await browser.$(
      'android=new UiSelector().resourceId("android:id/button1")'
    );

    if (
      await androidConfirmButton
        .isDisplayed()
        .catch(() => false)
    ) {
      await androidConfirmButton.click();
    } else {
      // Fallback: locate the destructive confirmation button by text
      const cancelOptions = await browser.$$(
        'android=new UiSelector().text("Cancel Registration")'
      );

      if (cancelOptions.length > 0) {
        await cancelOptions[cancelOptions.length - 1].click();
      } else {
        throw new Error(
          'Cancel registration confirmation dialog was not displayed.'
        );
      }
    }

    await browser.pause(2500);
  }

  public async clickBack() {
    const backButton = await browser.$('~event_detail_back');

    if (
      await backButton
        .isDisplayed()
        .catch(() => false)
    ) {
      await backButton.click();
    } else {
      // Reliable fallback when no testID is exposed
      await browser.back();
    }

    await browser.pause(1500);
  }

  public async isRegisteredBadgeDisplayed(): Promise<boolean> {
    const cancelButton = await browser.$('~event_cancel');

    return cancelButton
      .isDisplayed()
      .catch(() => false);
  }

  public async isRegisterButtonDisplayed(): Promise<boolean> {
    const registerButton = await browser.$('~event_register');

    return registerButton
      .isDisplayed()
      .catch(() => false);
  }
}

export default new EventDetailPage();