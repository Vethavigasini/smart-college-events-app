declare const browser: any;

import BasePage from './BasePage';

class EventsPage extends BasePage {
  public async isEventsScreenDisplayed(): Promise<boolean> {
    const searchInput = await browser.$('~dashboard_search');

    if (
      await searchInput
        .isDisplayed()
        .catch(() => false)
    ) {
      return true;
    }

    const eventsText = await browser.$(
      'android=new UiSelector().textContains("Events")'
    );

    return eventsText
      .isDisplayed()
      .catch(() => false);
  }

  public async search(query: string) {
    const searchInput = await browser.$('~dashboard_search');

    await searchInput.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Event search input was not displayed.',
    });

    await searchInput.clearValue();

    if (query.length > 0) {
      await searchInput.setValue(query);
    }
  }

  public async selectCategory(category: string) {
    const categoryId =
      `category_chip_${category.toLowerCase().replace(/\s+/g, '_')}`;

    const categoryChip = await browser.$(`~${categoryId}`);

    await categoryChip.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: `Category chip ${categoryId} was not displayed.`,
    });

    await categoryChip.click();
  }

  public async clickFirstEventCard() {
    const firstEventCard = await browser.$(
      '//*[@content-desc and starts-with(@content-desc, "event_card_")]'
    );

    await firstEventCard.waitForDisplayed({
      timeout: 20000,
      timeoutMsg:
        'No event card was displayed. Check event data and active search filters.',
    });

    await firstEventCard.click();
  }

  public async clickEventCard(eventId?: string) {
    if (eventId) {
      const exactCard = await browser.$(`~event_card_${eventId}`);

      if (
        await exactCard
          .isDisplayed()
          .catch(() => false)
      ) {
        await exactCard.click();
        return;
      }
    }

    await this.clickFirstEventCard();
  }
}

export default new EventsPage();