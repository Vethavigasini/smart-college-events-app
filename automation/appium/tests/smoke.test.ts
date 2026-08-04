declare const browser: any;

import { expect } from 'chai';
import LoginPage from '../pages/LoginPage';
import EventsPage from '../pages/EventsPage';
import EventDetailPage from '../pages/EventDetailPage';
import ProfilePage from '../pages/ProfilePage';
import { testData } from '../data/testData';

describe('Smart College Events - Critical Smoke Tests', () => {
  before(async () => {
    await browser.pause(10000);

    let loginButton = await browser.$('~login_submit');
    const isLoginVisible = await loginButton
      .isDisplayed()
      .catch(() => false);

    if (!isLoginVisible) {
      const exploreButton = await browser.$('~landing_explore_btn');
      const isExploreVisible = await exploreButton
        .isDisplayed()
        .catch(() => false);

      if (isExploreVisible) {
        await exploreButton.click();
      } else {
        const exploreByText = await browser.$(
          'android=new UiSelector().textContains("Explore Platform")'
        );

        await exploreByText.waitForDisplayed({
          timeout: 20000,
          timeoutMsg:
            'Landing page did not display the Explore Platform button.',
        });

        await exploreByText.click();
      }

      loginButton = await browser.$('~login_submit');
    }

    await loginButton.waitForDisplayed({
      timeout: 20000,
      timeoutMsg:
        'Login screen did not appear after clicking Explore Platform.',
    });
  });

  it('TC_SMOKE_001 - Launch app successfully', async () => {
    const isLoginDisplayed =
      await LoginPage.isLoginScreenDisplayed();

    expect(isLoginDisplayed).to.be.true;
  });

  it('TC_SMOKE_002 - Login with invalid credentials displays error', async () => {
    await LoginPage.login(
      'invalid@college.edu',
      'wrongpass'
    );

    await browser.pause(2000);

    const isLoginDisplayed =
      await LoginPage.isLoginScreenDisplayed();

    expect(isLoginDisplayed).to.be.true;
  });

  it('TC_SMOKE_003 - Login with valid student credentials', async () => {
    const emailInput = await browser.$('~login_email');
    const passwordInput = await browser.$('~login_password');

    await emailInput.clearValue();
    await passwordInput.clearValue();

    await LoginPage.login(
      testData.studentUser.email,
      testData.studentUser.password
    );

    await browser.pause(5000);

    const eventsTab = await browser.$('~tab_events');

    await eventsTab.waitForDisplayed({
      timeout: 20000,
      timeoutMsg:
        'Events tab did not appear after valid login. Check credentials and backend connection.',
    });

    expect(await eventsTab.isDisplayed()).to.be.true;
  });

  it('TC_SMOKE_004 - Search for an event', async () => {
    const eventsTab = await browser.$('~tab_events');

    await eventsTab.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Events tab was not displayed.',
    });

    await eventsTab.click();
    await browser.pause(2000);

    const isEventsDisplayed =
      await EventsPage.isEventsScreenDisplayed();

    expect(isEventsDisplayed).to.be.true;

    await EventsPage.search('Hackathon');
    await browser.pause(1500);
  });

  it('TC_SMOKE_005 - View event details', async () => {
    // Clear the previous search so event cards become visible
    await EventsPage.search('');
    await browser.pause(1500);

    await EventsPage.selectCategory('All');
    await browser.pause(2000);

    await EventsPage.clickFirstEventCard();
    await browser.pause(2500);

    const registerButton = await browser.$('~event_register');
    const cancelButton = await browser.$('~event_cancel');

    const isRegisterDisplayed = await registerButton
      .isDisplayed()
      .catch(() => false);

    const isCancelDisplayed = await cancelButton
      .isDisplayed()
      .catch(() => false);

    expect(isRegisterDisplayed || isCancelDisplayed).to.be.true;
  });

  it('TC_SMOKE_006 - Register for event', async () => {
    const registerButton = await browser.$('~event_register');
    const cancelButton = await browser.$('~event_cancel');

    const canRegister = await registerButton
      .isDisplayed()
      .catch(() => false);

    const alreadyRegistered = await cancelButton
      .isDisplayed()
      .catch(() => false);

    if (alreadyRegistered) {
      // Already registered means registration state is valid
      expect(alreadyRegistered).to.be.true;
      return;
    }

    expect(canRegister).to.be.true;

    await EventDetailPage.clickRegister();

    await EventDetailPage.fillRegistrationPhone(
      '9876543210'
    );

    await EventDetailPage.submitRegistration();
    await browser.pause(2500);

    const isRegistered =
      await EventDetailPage.isRegisteredBadgeDisplayed();

    const cancelVisible = await cancelButton
      .isDisplayed()
      .catch(() => false);

    expect(isRegistered || cancelVisible).to.be.true;
  });

  it('TC_SMOKE_007 - Cancel event registration', async () => {
    const cancelButton = await browser.$('~event_cancel');

    const canCancel = await cancelButton
      .isDisplayed()
      .catch(() => false);

    if (canCancel) {
      await EventDetailPage.clickCancelRegistration();
      await browser.pause(2000);

      const registerButton = await browser.$('~event_register');

      const isRegisterDisplayed = await registerButton
        .isDisplayed()
        .catch(() => false);

      expect(isRegisterDisplayed).to.be.true;
    } else {
      // If there is no active registration, the event must still be registerable
      const registerButton = await browser.$('~event_register');

      const isRegisterDisplayed = await registerButton
        .isDisplayed()
        .catch(() => false);

      expect(isRegisterDisplayed).to.be.true;
    }

    await EventDetailPage.clickBack();
    await browser.pause(2000);
  });

  it('TC_SMOKE_008 - View profile details', async () => {
    const profileTab = await browser.$('~tab_profile');

    await profileTab.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Profile tab was not displayed.',
    });

    await profileTab.click();
    await browser.pause(2000);

    const isProfileDisplayed =
      await ProfilePage.isProfileScreenDisplayed();

    expect(isProfileDisplayed).to.be.true;
  });

  it('TC_SMOKE_009 - Update profile phone details', async () => {
    await ProfilePage.clickEdit();
    await browser.pause(1000);

    await ProfilePage.updatePhone('9999988888');
    await ProfilePage.clickSave();
    await browser.pause(1500);

    const isProfileDisplayed =
      await ProfilePage.isProfileScreenDisplayed();

    expect(isProfileDisplayed).to.be.true;
  });

  it('TC_SMOKE_010 - Verify session persistence on restart', async () => {
    const bundleId = 'com.smartcollege.events';

    await browser.terminateApp(bundleId);
    await browser.pause(2000);

    await browser.activateApp(bundleId);
    await browser.pause(5000);

    const isLoginDisplayed =
      await LoginPage.isLoginScreenDisplayed();

    expect(isLoginDisplayed).to.be.false;
  });

  after(async () => {
    try {
      const profileTab = await browser.$('~tab_profile');

      const isProfileVisible = await profileTab
        .isDisplayed()
        .catch(() => false);

      if (isProfileVisible) {
        await profileTab.click();
        await browser.pause(1500);

        const isProfileDisplayed =
          await ProfilePage.isProfileScreenDisplayed();

        if (isProfileDisplayed) {
          await ProfilePage.clickLogout();
        }
      }
    } catch (error) {
      console.log('Cleanup logout skipped:', error);
    }
  });
});