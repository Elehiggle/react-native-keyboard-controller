# KeyboardStickyView: wrong keyboard height after rotating a full-screen iPad

On an iPad Pro 13-inch (M5) simulator with iPadOS 27.0, rotating a full-screen app with the software keyboard open sometimes leaves `KeyboardStickyView` behind the keyboard. This screen keeps a `TextInput` inside a `KeyboardStickyView` at the bottom. It shows the window size, animated keyboard height and progress, and the last library `keyboardDidShow` and React Native `keyboardDidChangeFrame` values. The animated height is negated for display, so an open keyboard reads as positive.

The branch uses upstream `77c25bdf57fc9007903d2596fc96a6f9022176b7` (package version 1.22.8). Commit `bc0b4cc78bf3924a333aa1266776e0a7db9fa4df` adds the screen as “31. Sticky view rotation” with its navigation entries. Two more commits add this guide and the screenshots. The library source is unchanged, so this branch shows the bug. The screen uses only dependencies FabricExample already has.

## Run on iOS

These commands target an Apple silicon Mac with Node 22.13.0 or newer, Yarn 1, Ruby 3.3.10, Bundler and Xcode. CocoaPods is installed through the example's Gemfile. The Release app embeds its JS bundle and runs without Metro.

```sh
git clone --branch codex/repro-ipad-rotation --single-branch https://github.com/Elehiggle/react-native-keyboard-controller.git rnkc-repro-ipad-rotation
cd rnkc-repro-ipad-rotation
yarn install --frozen-lockfile
yarn --cwd FabricExample install --frozen-lockfile
cd FabricExample
bundle install
cd ios
bundle exec pod install --no-repo-update
```

Build the Release app from `FabricExample/ios`:

```sh
RCT_NO_LAUNCH_PACKAGER=1 xcodebuild \
  -workspace KeyboardControllerFabricExample.xcworkspace \
  -scheme KeyboardControllerFabricExample -configuration Release \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath build ARCHS=arm64 ONLY_ACTIVE_ARCH=YES \
  IPHONEOS_DEPLOYMENT_TARGET=15.1 build
```

Boot an iPad Pro 13-inch (M5) simulator with iPadOS 27.0. With only that simulator booted, install and launch the app:

```sh
xcrun simctl install booted build/Build/Products/Release-iphonesimulator/KeyboardControllerFabricExample.app
xcrun simctl launch booted org.reactjs.native.example.KeyboardControllerFabricExample
```

The recorded run reused installed dependencies and had local CocoaPods changes to `Podfile.lock` and `PrivacyInfo.xcprivacy`; the library source was unchanged. Those generated changes are not included in this public branch. The revised setup above uses Bundler, omits the recorded build's resource throttling and disables automatic Metro startup. It has not been verified from a fresh clone.

## Reproduce

1. Keep the app full screen and use the software keyboard. Start in portrait.
2. Open **31. Sticky view rotation** and tap the input (`sticky_input`). On this simulator the fresh-open height is 403 pt.
3. Rotate to landscape left with the input focused. Check the readout after 5 s and again after 20 s.
4. Rotate back to portrait. Check again after 5 s and 20 s.
5. Repeat the round trip once. Then restart the app, reopen the screen and make two more round trips. Repeat for up to ten app starts; the bug may not appear on every attempt.
6. Watch for `height: 44.25` in landscape or `height: 373.50` in portrait, with `progress: 1.00` and the input behind the keyboard.

Expected: after rotation settles, the height matches the visible docked keyboard: 498 pt in landscape and 403 pt in portrait on this simulator. The input stays right above it.

The recorded run used ten app starts with two round trips each. Screenshots were taken 5 and 20 seconds after Maestro's `setOrientation` command returned:

| Direction        | Wrong after 5 s | Wrong after 20 s | Wrong height | Fresh-open reference |
| ---------------- | --------------- | ---------------- | ------------ | -------------------- |
| To landscape     | 4/20            | 4/20             | 44.25 pt     | 498 pt               |
| Back to portrait | 3/20            | 3/20             | 373.5 pt     | 403 pt               |

The same seven turns were wrong at both times. These forty turns come from one simulator session and are not independent estimates of a failure rate. Four rotations with the keyboard closed kept height 0 and progress 0.

A later, separate check of the same saved build used three app starts with two round trips each and found no wrong height (0/6 in each direction). The bug does not occur on every attempt.

## Screenshots

All three show the iPad Pro 13-inch (M5) simulator, iPadOS 27.0, on this branch's library code. They are scaled to half size. The RN event line shows the latest received event and can be stale; the fresh portrait image still displays an earlier landscape event.

Fresh portrait opening, height 403:

![Fresh portrait opening with the input right above the keyboard](repro-media/ipad-rotation/fresh-portrait.png)

Wrong landscape turn, 20 s after the rotation, height 44.25:

![Landscape after rotation with the input behind the keyboard](repro-media/ipad-rotation/run02-pair1-landscape-20s.png)

Wrong portrait turn, 20 s after the rotation, height 373.5:

![Portrait after rotation with the input partly behind the keyboard](repro-media/ipad-rotation/run02-pair1-portrait-20s.png)

The [capture table](repro-media/ipad-rotation/summary.csv) has one row for each of the 80 screenshots, including the height, progress, reference height and result. `captureStart` and `captureEnd` are seconds after the orientation command returned.

## Verified environment

- macOS 27.0.1 (26A434), Xcode 27.1 (27A9275)
- iPad Pro 13-inch (M5) simulator, iPadOS 27.0 (24A434), full screen, software keyboard
- React Native 0.87.1, Fabric, Hermes, Release build
- React 19.2.3, Reanimated 4.7.1, Worklets 0.13.0

There is no result for iPhone, a physical device or an older OS. This branch does not contain a fix.
