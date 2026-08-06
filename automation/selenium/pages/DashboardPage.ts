import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  private dashboardTitle = By.xpath(
    "//*[contains(text(),'Student Dashboard')]"
  );

  private searchInput = By.css(
    '[data-testid="dashboard_search"], ' +
      '[aria-label="dashboard_search"], ' +
      'input[placeholder*="Search"]'
  );

  private categoryAllChip = By.css(
    '[data-testid="category_chip_all"], ' +
      '[aria-label="category_chip_all"]'
  );

  private categoryTechChip = By.css(
    '[data-testid="category_chip_tech"], ' +
      '[aria-label="category_chip_tech"]'
  );

  private firstEventCard = By.css(
    '[data-testid^="event_card_"], ' +
      '[aria-label^="event_card_"]'
  );

  private eventsTab = By.css(
    '[data-testid="tab_events"], ' +
      '[aria-label="tab_events"]'
  );

  private profileTab = By.css(
    '[data-testid="tab_profile"], ' +
      '[aria-label="tab_profile"]'
  );

  constructor(driver: WebDriver) {
    super(driver);
  }

  async searchEvent(query: string): Promise<void> {
    await this.type(this.searchInput, query);
  }

  async selectCategoryAll(): Promise<void> {
    await this.click(this.categoryAllChip);
  }

  async selectCategoryTech(): Promise<void> {
    await this.click(this.categoryTechChip);
  }

  async clickFirstEvent(): Promise<void> {
    const el = await this.driver.findElement(this.firstEventCard);
    await this.driver.executeScript('arguments[0].scrollIntoView(true);', el);
    await this.driver.sleep(500);
    await this.driver.executeScript('arguments[0].click();', el);
  }

  async clickEventsTab(): Promise<void> {
    await this.click(this.eventsTab);
  }

  async clickProfileTab(): Promise<void> {
    await this.click(this.profileTab);
  }

  async isDashboardLoaded(): Promise<boolean> {
    return this.isDisplayed(this.dashboardTitle);
  }

  async isEventsScreenLoaded(): Promise<boolean> {
    return this.isDisplayed(this.searchInput);
  }

  async isAuthenticated(): Promise<boolean> {
    const eventsTabVisible =
      await this.isDisplayed(this.eventsTab);

    const profileTabVisible =
      await this.isDisplayed(this.profileTab);

    return eventsTabVisible || profileTabVisible;
  }
}