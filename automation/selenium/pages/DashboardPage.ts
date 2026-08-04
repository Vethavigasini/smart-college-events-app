import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  private searchInput = By.css('[data-testid="dashboard_search"], input[placeholder*="Search"]');
  private categoryAllChip = By.css('[data-testid="category_chip_all"]');
  private categoryTechChip = By.css('[data-testid="category_chip_tech"]');
  private firstEventCard = By.css('[data-testid^="event_card_"], div[role="button"]');
  private eventsTab = By.css('[data-testid="tab_events"]');
  private profileTab = By.css('[data-testid="tab_profile"]');

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
    await this.click(this.firstEventCard);
  }

  async clickEventsTab(): Promise<void> {
    await this.click(this.eventsTab);
  }

  async clickProfileTab(): Promise<void> {
    await this.click(this.profileTab);
  }

  async isDashboardLoaded(): Promise<boolean> {
    return await this.isDisplayed(this.searchInput);
  }
}
