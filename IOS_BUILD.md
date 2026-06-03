# Building LEXOR for iOS

## Prerequisites
- macOS with Xcode 15+
- Node.js 18+
- CocoaPods (`sudo gem install cocoapods`)

## Steps

```bash
# Install dependencies
npm install

# Build the web app
npm run build

# Sync with Capacitor
npx cap sync ios

# Open in Xcode
npx cap open ios
```

Then in Xcode:
1. Select your development team in Signing & Capabilities
2. Set your Bundle Identifier (com.luxor.app)
3. Choose a simulator or connected device
4. Press Run (⌘R)

## For App Store submission
1. Create app in App Store Connect
2. Build > Archive in Xcode
3. Upload via Organizer
4. Submit for review

## Push Notifications
Push notifications require:
1. Apple Push Notification service (APNs) certificate in Apple Developer
2. Configure in Xcode Capabilities
3. Server-side FCM/APNs setup
