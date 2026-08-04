# macOS Local Android Setup Guide

This guide details the step-by-step setup required to compile, launch, and automate the **Smart College Events** React Native Android app on macOS.

---

## 1. Prerequisites

### Java Development Kit (JDK 17)
The project requires Java 17 for Android builds.
1. Install using Homebrew:
   ```bash
   brew install openjdk@17
   ```
2. Symlink the system Java wrapper to locate this JDK:
   ```bash
   sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
   ```
3. Verify Java version:
   ```bash
   java -version
   ```
   *Expected output: `openjdk version "17.0.x" ...`*

### Node.js & npm
The React Native app and test runner require Node.js 18 or 20.
1. Install Node.js:
   ```bash
   brew install node@20
   ```
2. Verify node and npm:
   ```bash
   node -v
   npm -v
   ```

---

## 2. Android Studio & SDK Configuration

1. Download and install **Android Studio** (Koala or later).
2. During setup, select standard installation to get:
   *   Android SDK Platform
   *   Android SDK Build-Tools
   *   Android Emulator
3. Open Android Studio, go to **Settings (Preferences)** > **Languages & Frameworks** > **Android SDK**:
   *   Under **SDK Platforms**, check **Android 15.0 (VanillaIceCream)** (API 35) or **Android 14.0 (UpsideDownCake)**.
   *   Under **SDK Tools**, check:
       *   Android SDK Build-Tools
       *   Android Emulator
       *   Android SDK Platform-Tools
       *   Intel x86 Emulator Accelerator (HAXM installer) *[Required for Intel Macs only]*
4. Click **Apply** to download and install.

---

## 3. Environment Variables Setup

Configure the path variables so that `adb`, emulator, and `gradlew` can be called from the terminal.
1. Open your shell profile configuration (`~/.zshrc` or `~/.bash_profile`):
   ```bash
   nano ~/.zshrc
   ```
2. Add the following environment variables:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   
   # Prefer JDK 17
   export JAVA_HOME=/Library/Java/JavaVirtualMachines/openjdk-17.jdk/Contents/Home
   export PATH=$JAVA_HOME/bin:$PATH
   ```
3. Load the updated profile:
   ```bash
   source ~/.zshrc
   ```
4. Verify environment setup:
   ```bash
   adb --version
   emulator -list-avds
   ```

---

## 4. Android Virtual Device (AVD) Configuration

1. Open Android Studio, click **More Actions** > **Virtual Device Manager**.
2. Click **Create Device**.
3. Select **Pixel 7** and click **Next**.
4. Select a system image:
   *   **Release Name**: `VanillaIceCream` or `UpsideDownCake` (API level 34/35).
   *   **ABI**: `arm64-v8a` (Recommended for Apple Silicon M1/M2/M3) or `x86_64` (for Intel Macs).
5. Click **Next** and name the device exactly `Pixel_7`.
6. Click **Finish** to save.

---

## 5. Appium Server & Driver Setup

To automate testing, Appium 2 and the UiAutomator2 driver must be installed.
1. Install Appium 2 globally:
   ```bash
   npm install -g appium
   ```
2. Install UiAutomator2 driver:
   ```bash
   appium driver install uiautomator2
   ```
3. Install WDIO CLI globally / locally:
   ```bash
   npm install -g @wdio/cli
   ```

---

## 6. Running Automation Suite Locally

Follow these sequential commands to verify the environment and run the test suite:

### 1. Launch the Emulator
```bash
npm run emulator:start
```
*Wait for the virtual device screen to display the home screen.*

### 2. Start the Backend Server
```bash
cd backend
npm install
npm start
```
*Ensure it connects successfully to MongoDB.*

### 3. Build & Install Android App
```bash
# Returns native project reverse proxies and triggers bundle
npx expo run:android
```

### 4. Run Appium Tests
Execute the tests directly using the package script wrapper:
```bash
npm run android:test
```

### 5. Generate Test Reports
Generate the consolidated Excel, HTML dashboards, and Markdown summaries:
```bash
npm run reports
```
All generated report files will be placed in the project root folder.
