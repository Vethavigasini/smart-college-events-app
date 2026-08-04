import BasePage from './BasePage';

class EventsPage extends BasePage {
  public async search(query: string) {
    await this.setValue('dashboard_search', query);
  }

  public async clickSort() {
    await this.click('event_sort_btn');
  }

  public async selectSortOption(option: string) {
    const sortId = `sort_option_${option.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '')}`;
    await this.click(sortId);
  }

  public async selectCategory(category: string) {
    const chipId = `category_chip_${category.toLowerCase()}`;
    await this.click(chipId);
  }

  public async selectStatusTab(status: string) {
    const filterId = `status_filter_${status.toLowerCase()}`;
    await this.click(filterId);
  }

  public async clickEventCard(eventId: string) {
    await this.click(`event_card_${eventId}`);
  }

  public async isEventsScreenDisplayed(): Promise<boolean> {
    return this.isDisplayed('dashboard_search');
  }
}

export default new EventsPage();
