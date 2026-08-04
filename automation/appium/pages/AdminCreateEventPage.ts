import BasePage from './BasePage';

class AdminCreateEventPage extends BasePage {
  public async createEvent(
    category: string,
    title: string,
    shortDesc: string,
    desc: string,
    startDate: string,
    endDate: string,
    venue: string,
    venueAddress: string,
    organizer: string,
    orgEmail: string,
    orgPhone: string,
    capacity: string,
    price: string,
    tags: string,
    featured = false
  ) {
    // Select category
    await this.click(`admin_create_cat_${category.toLowerCase()}`);

    // Fill text inputs
    await this.setValue('admin_create_title', title);
    await this.setValue('admin_create_short_desc', shortDesc);
    await this.setValue('admin_create_desc', desc);
    await this.setValue('admin_create_start_date', startDate);
    await this.setValue('admin_create_end_date', endDate);
    await this.setValue('admin_create_venue', venue);
    await this.setValue('admin_create_venue_address', venueAddress);
    await this.setValue('admin_create_organizer', organizer);
    await this.setValue('admin_create_org_email', orgEmail);
    await this.setValue('admin_create_org_phone', orgPhone);
    await this.setValue('admin_create_capacity', capacity);
    await this.setValue('admin_create_price', price);
    await this.setValue('admin_create_tags', tags);

    // Toggle featured if true
    if (featured) {
      await this.click('admin_create_featured_switch');
    }

    // Submit form (handles create testID)
    await this.click('admin_create_event');
  }

  public async updateEventTitle(newTitle: string) {
    await this.setValue('admin_create_title', newTitle);
    await this.click('admin_update_event');
  }

  public async clickBack() {
    await this.click('admin_create_back');
  }

  public async isCreateEventScreenDisplayed(): Promise<boolean> {
    return this.isDisplayed('admin_create_title');
  }
}

export default new AdminCreateEventPage();
