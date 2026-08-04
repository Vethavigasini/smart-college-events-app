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
  }

  public async clickCancelRegistration() {
    await this.click('event_cancel');
  }

  public async isRegisteredBadgeDisplayed(): Promise<boolean> {
    return this.isDisplayed('event_cancel');
  }
}

export default new EventDetailPage();
