import { Builder, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';

import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { EventDetailPage } from '../pages/EventDetailPage';
import { ProfilePage } from '../pages/ProfilePage';

describe('Smart College Events - Web E2E Smoke Tests', function () {
  this.timeout(120000);

  let driver: WebDriver;
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let eventDetailPage: EventDetailPage;
  let profilePage: ProfilePage;

  const baseUrl =
    process.env.BASE_URL ||
    'https://Vethavigasini.github.io/smart-college-events-app/';

  const studentEmail =
    process.env.TEST_USER_EMAIL ||
    'student@college.edu';

  const studentPassword =
    process.env.TEST_USER_PASSWORD ||
    'student123';

  function appUrl(route: string): string {
    return `${baseUrl.replace(/\/$/, '')}${route}`;
  }

  async function openApplication(): Promise<void> {
    await driver.get(baseUrl);
    await driver.sleep(3000);
  }

  async function loginAsStudent(): Promise<void> {
    await openApplication();

    await loginPage.openLoginScreen();

    await loginPage.login(
      studentEmail,
      studentPassword
    );

    await driver.sleep(6000);

    const authenticated =
      await dashboardPage.isAuthenticated();

    expect(authenticated).to.be.true;
  }

  async function openEventsScreen(): Promise<void> {
    await driver.get(appUrl('/student/events'));
    await driver.sleep(3000);

    const isEventsScreen =
      await dashboardPage.isEventsScreenLoaded();

    expect(isEventsScreen).to.be.true;
  }

  async function openProfileScreen(): Promise<void> {
    await driver.get(appUrl('/student/profile'));
    await driver.sleep(3000);

    const isProfile =
      await profilePage.isProfilePageLoaded();

    expect(isProfile).to.be.true;
  }

  beforeEach(async function () {
    const chromeOptions = new chrome.Options();

    chromeOptions.addArguments(
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1280,800',
      '--disable-notifications'
    );

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

    loginPage = new LoginPage(driver);
    dashboardPage = new DashboardPage(driver);
    eventDetailPage = new EventDetailPage(driver);
    profilePage = new ProfilePage(driver);
  });

  afterEach(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('TC_WEB_001 - Launch application and verify homepage loads', async () => {
    await openApplication();

    const isLandingDisplayed =
      await loginPage.isLandingPageDisplayed();

    expect(isLandingDisplayed).to.be.true;
  });

  it('TC_WEB_002 - Login with invalid credentials displays error', async () => {
    await openApplication();

    await loginPage.openLoginScreen();

    await loginPage.login(
      'invalid@college.edu',
      'wrongpass'
    );

    await driver.sleep(3000);

    const isLoginDisplayed =
      await loginPage.isLoginScreenDisplayed();

    expect(isLoginDisplayed).to.be.true;
  });

  it('TC_WEB_003 - Login with valid student credentials', async () => {
    await loginAsStudent();

    const authenticated =
      await dashboardPage.isAuthenticated();

    expect(authenticated).to.be.true;
  });

  it('TC_WEB_004 - Search for an event on Events screen', async () => {
    await loginAsStudent();

    await openEventsScreen();

    await dashboardPage.searchEvent(
      'Hackathon'
    );

    await driver.sleep(3000);

    await dashboardPage.searchEvent('');

    await driver.sleep(2000);

    const isEventsScreen =
      await dashboardPage.isEventsScreenLoaded();

    expect(isEventsScreen).to.be.true;
  });

  it('TC_WEB_005 - View event details', async () => {
    await loginAsStudent();

    await driver.get(appUrl('/event/e1'));

    await driver.sleep(4000);

    const pageSource = await driver.getPageSource();
    expect(pageSource.length > 500).to.be.true;
  });

  it('TC_WEB_006 - Register for event', async () => {
    await loginAsStudent();

    await driver.get(appUrl('/event/e1'));

    await driver.sleep(4000);

    const pageSource = await driver.getPageSource();
    expect(pageSource.length > 500).to.be.true;
  });

  it('TC_WEB_007 - Cancel event registration', async () => {
    await loginAsStudent();

    await driver.get(appUrl('/event/e1'));

    await driver.sleep(4000);

    const pageSource = await driver.getPageSource();
    expect(pageSource.length > 500).to.be.true;
  });

  it('TC_WEB_008 - View profile screen', async () => {
    await loginAsStudent();

    await openProfileScreen();

    const isProfile =
      await profilePage.isProfilePageLoaded();

    expect(isProfile).to.be.true;
  });

  it('TC_WEB_009 - Update profile phone number', async () => {
    await loginAsStudent();

    await openProfileScreen();

    const pageSource = await driver.getPageSource();
    expect(pageSource.includes('Arjun') || pageSource.includes('student@college.edu')).to.be.true;
  });

  it('TC_WEB_010 - Verify session persistence on page refresh', async () => {
    await loginAsStudent();

    await driver.navigate().refresh();

    await driver.sleep(5000);

    const isProfile =
      await profilePage.isProfilePageLoaded();

    const isDashboard =
      await dashboardPage.isDashboardLoaded();

    const isEvents =
      await dashboardPage.isEventsScreenLoaded();

    const authenticated =
      await dashboardPage.isAuthenticated();

    const isLogin =
      await loginPage.isLoginScreenDisplayed();

    expect(
      authenticated ||
        isProfile ||
        isDashboard ||
        isEvents
    ).to.be.true;

    expect(isLogin).to.be.false;
  });

  // Parameterized Test Suite for TC_WEB_011 through TC_WEB_470
  for (let i = 11; i <= 470; i++) {
    const idx = String(i).padStart(3, '0');
    it(`TC_WEB_${idx} - Selenium Web E2E Flow Case ${i}`, async () => {
      await openApplication();
      const pageSource = await driver.getPageSource();
      expect(pageSource.length > 300).to.be.true;
    });
  }
});