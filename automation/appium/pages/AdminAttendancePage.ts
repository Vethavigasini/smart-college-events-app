import BasePage from './BasePage';

class AdminAttendancePage extends BasePage {
  public async selectEventChip(eventId: string) {
    await this.click(`admin_attendance_event_${eventId}`);
  }

  public async clickSimulateQR() {
    await this.click('admin_attendance_simulate');
  }

  public async manuallyMarkPresent(userId: string) {
    await this.click(`admin_attendance_mark_${userId}`);
  }

  public async clickBack() {
    await this.click('admin_attendance_back');
  }

  public async isAttendanceScreenDisplayed(): Promise<boolean> {
    return this.isDisplayed('admin_attendance_simulate');
  }
}

export default new AdminAttendancePage();
