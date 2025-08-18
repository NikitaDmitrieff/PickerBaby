## PickerBaby (iOS · Expo)

A modern remake of “finger chooser” with one twist: the finger closest to the bottom-right corner can never win.

### Why it’s fast and smooth
- **Expo SDK 53** (RN 0.79, React 19, New Architecture)
- **React Native Gesture Handler v2** for native, deterministic touch handling
- **Reanimated 3** for UI-thread animations
- **React Native Skia** for GPU-accelerated circles/glow rendering
- **NativeWind** (Tailwind for RN) for quick styling
- **Expo Router** for file-based navigation
- **Expo Haptics** for crisp Taptic feedback

## Quick start
1) Install dependencies
```bash
npm install
```

2) iOS native project (already generated, but here’s the command if needed)
```bash
npx expo prebuild -p ios
```

3) Run on iOS
```bash
npm run ios
```

If you change native modules, run prebuild again. Prefer a Development Build over Expo Go when using Skia/Reanimated.

## How to play
- Place 2+ fingers on the screen (multi-touch supported).
- Tap “Pick”.
- The finger nearest to the bottom-right corner is excluded.
- A random winner is chosen among the rest, with haptics feedback.

## Project structure (high level)
- `app/_layout.tsx`: Root layout wrapped in `GestureHandlerRootView`
- `app/(tabs)/index.tsx`: Main game screen (multi-touch + Skia rendering + haptics)
- `app/(tabs)/two.tsx`: Placeholder “Settings” tab
- `app/index.tsx`: Root alias of the game screen
- `app/+html.tsx` and `app/global.css`: Tailwind on Web/Dev
- `babel.config.js`: Babel config (keep Reanimated plugin last)
- `tailwind.config.js`: Tailwind/NativeWind content paths
- `app.json`: App metadata and Expo Router plugin
- `ios/`: Native iOS project (Pods, Xcode project, etc.)

## Implementation notes
- Multi-touch is tracked via the RN Responder system
  - `nativeEvent.touches` gives a stable `identifier` per finger
  - Finger positions are stored in a `Map<number, { id, x, y }>` and updated on move
- On Pick:
  - Snapshot current fingers
  - Compute Euclidean distance to the view’s bottom-right `(width, height)`
  - Exclude the closest finger
  - Randomly select a winner from the remainder
  - Trigger haptics
- Rendering:
  - Skia draws circles, a ring, and a soft glow for each finger
  - NativeWind classes style UI elements

## Configuration
### Babel
- Ensure the config matches the repository’s `babel.config.js`
- Keep `'react-native-reanimated/plugin'` as the LAST plugin

### Tailwind / NativeWind
- `tailwind.config.js`
```js
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```
- `app/global.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
- `app/+html.tsx` imports `./global.css` for web/dev

### Gesture Handler
Wrap the app once at the root (done in `app/_layout.tsx`).

## Troubleshooting
- “.plugins is not a valid Plugin property”: ensure the Babel config matches this repo and that the Router and NativeWind entries are placed correctly; keep Reanimated plugin last. Clear cache and restart:
```bash
npx expo start --clear
```
- Port in use: choose another port or stop the other dev server:
```bash
npx expo start --port 8090
```
- Version warnings: align to Expo’s recommended versions
```bash
npx expo install
```

## Roadmap ideas
- Winner pulse/bounce using Reanimated shared values
- Theming and subtle sounds
- Settings: toggle glows, ring sizes, colors

## License
MIT


