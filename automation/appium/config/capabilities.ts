export const androidCapabilities = {
  platformName: 'Android',
  'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'emulator-5554',
  'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || '14.0',
  'appium:automationName': 'UiAutomator2',
  'appium:app': process.env.APK_PATH || './android/app/build/outputs/apk/debug/app-debug.apk',
  'appium:appPackage': 'com.smartcollege.events',
  'appium:appActivity': 'com.smartcollege.events.MainActivity',
  'appium:noReset': false,
  'appium:fullReset': false,
  'appium:newCommandTimeout': 240,
  'appium:autoGrantPermissions': true
};
