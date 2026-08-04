import BasePage from './BasePage';

class AdminDashboardPage extends BasePage {
  public async clickQuickCreateEvent() {
    await this.click('admin_quick_create_event');
  }

  public async clickQuickAttendance() {
    await this.click('admin_quick_attendance');
  }

  public async clickQuickAnalytics() {
    await this.click('admin_quick_analytics');
  }

  public async clickQuickUsers() {
    await this.click('admin_quick_users');
  }

  public async clickNewEventButton() {
    await this.click('admin_create_event');
  }

  public async viewEvent(eventId: string) {
    await this.click(`admin_view_event_${eventId}`);
  }

  public async editEvent(eventId: string) {
    await this.click(`admin_update_event_${eventId}`);
  }

  public async deleteEvent(eventId: string) {
    await this.click(`admin_delete_event_${eventId}`);
  }

  public async isAdminDashboardDisplayed(): Promise<boolean> {
    return this.isDisplayed('admin_quick_create_event');
  }
}

export default new AdminDashboardPage();
