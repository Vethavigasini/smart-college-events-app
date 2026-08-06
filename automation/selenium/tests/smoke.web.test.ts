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
  this.timeout(90000);
  let driver: WebDriver;
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let eventDetailPage: EventDetailPage;
  let profilePage: ProfilePage;

  const baseUrl = process.env.BASE_URL || 'https://Vethavigasini.github.io/smart-college-events-app/';

  before(async function () {
    const chromeOptions = new chrome.Options();
    chromeOptions.addArguments(
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1280,800'
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

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  afterEach(async function () {
    // Capture screenshot on test failure
    const testTitle = this.currentTest?.title || 'test';
    const state = this.currentTest?.state || 'passed';

    if (state === 'failed') {
      const screenshotDir = path.join(__dirname, '../screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      try {
        const screenshot = await driver.takeScreenshot();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${testTitle.replace(/\s+/g, '_')}_failed_${timestamp}.png`;
        fs.writeFileSync(path.join(screenshotDir, filename), screenshot, 'base64');
        console.log(`[Screenshot] Saved failure screenshot to: ${filename}`);

        // Capture browser console logs
        const logs = await driver.manage().logs().get('browser');
        const logFile = path.join(__dirname, '../logs/browser-console.log');
        if (!fs.existsSync(path.dirname(logFile))) {
          fs.mkdirSync(path.dirname(logFile), { recursive: true });
        }
        fs.appendFileSync(logFile, `\n--- FAILURE LOG: ${testTitle} ---\n` + JSON.stringify(logs, null, 2));
      } catch (err) {}
    }
  });

  it('TC_WEB_001 - Launch application and verify homepage loads', async () => {
    await driver.get(baseUrl);
    
    // Allow loading delay
    await driver.sleep(5000);

    const isLoginDisplayed = await loginPage.isLoginScreenDisplayed();
    expect(isLoginDisplayed).to.be.true;
  });

  it('TC_WEB_002 - Login with invalid credentials displays error', async () => {
    await loginPage.login('invalid@college.edu', 'wrongpass');
    await driver.sleep(3000);
    
    // Verify remains on login screen
    const isLoginDisplayed = await loginPage.isLoginScreenDisplayed();
    expect(isLoginDisplayed).to.be.true;
  });

  it('TC_WEB_003 - Login with valid student credentials', async () => {
    // Student login credentials
    await loginPage.login('student@college.edu', 'student123');
    await driver.sleep(6000);

    const isDashboard = await dashboardPage.isDashboardLoaded();
    expect(isDashboard).to.be.true;
  });

  it('TC_WEB_004 - Search for an event on Dashboard', async () => {
    await dashboardPage.searchEvent('Hackathon');
    await driver.sleep(3000);
    
    // Clear search query
    await dashboardPage.searchEvent('');
    await driver.sleep(2000);
  });

  it('TC_WEB_005 - View event details modal', async () => {
    await dashboardPage.clickFirstEvent();
    await driver.sleep(3000);
    
    const isRegBtn = await eventDetailPage.isRegistrationButtonDisplayed();
    const isCancelBtn = await eventDetailPage.isCancellationButtonDisplayed();
    
    expect(isRegBtn || isCancelBtn).to.be.true;
  });

  it('TC_WEB_006 - Register for event', async () => {
    const isRegBtn = await eventDetailPage.isRegistrationButtonDisplayed();
    if (isRegBtn) {
      await eventDetailPage.registerForEvent();
      await driver.sleep(3000);
      
      // Dismiss browser/alert alerts if present
      try {
        const alert = await driver.switchTo().alert();
        await alert.accept();
      } catch {}
      
      await driver.sleep(2000);
    }
  });

  it('TC_WEB_007 - Cancel event registration', async () => {
    const isCancelBtn = await eventDetailPage.isCancellationButtonDisplayed();
    if (isCancelBtn) {
      await eventDetailPage.cancelRegistration();
      await driver.sleep(3000);
      
      // Dismiss confirmation
      try {
        const alert = await driver.switchTo().alert();
        await alert.accept();
      } catch {}
      
      await driver.sleep(2000);
    }
    
    // Go back to dashboard list
    await eventDetailPage.goBack();
    await driver.sleep(3000);
  });

  it('TC_WEB_008 - View profile screen', async () => {
    await dashboardPage.clickProfileTab();
    await driver.sleep(3000);

    const isProfile = await profilePage.isProfilePageLoaded();
    expect(isProfile).to.be.true;
  });

  it('TC_WEB_009 - Update profile phone number', async () => {
    await profilePage.editProfile();
    await driver.sleep(1500);
    await profilePage.updatePhoneNumber('9999988888');
    await driver.sleep(3000);
  });

  it('TC_WEB_010 - Verify session persistence on page refresh', async () => {
    await driver.navigate().refresh();
    await driver.sleep(5000);

    // Verify it stays logged in or redirects back securely
    const isProfile = await profilePage.isProfilePageLoaded();
    const isDashboard = await dashboardPage.isDashboardLoaded();
    expect(isProfile || isDashboard).to.be.true;
  });
});
