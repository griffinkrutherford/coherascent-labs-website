# Mobile App Plan

As of March 23, 2026, the best default path for this app is `React Native + Expo`.

## Why

- One `TypeScript` codebase can target both `iOS` and `Android`.
- Expo is built for shipping one project across both platforms with native behavior.
- It is the fastest path from polished UI renders to a real product if the team already thinks in components, layout systems, and frontend-style workflows.
- If deeper native control is needed later, Expo supports `prebuild` instead of forcing a rewrite.

Sources:
- https://docs.expo.dev/
- https://docs.expo.dev/tutorial/create-your-first-app/
- https://docs.expo.dev/workflow/prebuild

## Recommended Build Steps

1. Turn the renders into a real design system first.
   Do not try to convert screenshots directly into code.
   Rebuild them as reusable components such as:
   - `PhoneFrame`
   - `QuestionCard`
   - `CaptureScreen`
   - `ProcessingScreen`
   - `FeedbackScreen`
   - buttons
   - pills
   - nav
   - spacing tokens
   - color tokens

2. Start a real app with Expo.
   Create the project with:

   ```bash
   npx create-expo-app@latest
   ```

   Then build each screen in React Native.

   Source:
   - https://docs.expo.dev/tutorial/create-your-first-app/

3. Add navigation and flows.
   Build actual app flows for:
   - capture/upload
   - processing
   - feedback
   - voice upload
   - question view

4. Add native capabilities only when needed.
   Use Expo and React Native libraries first for:
   - camera
   - file upload
   - permissions
   - notifications
   - device integrations

   If something needs deeper native access, use:

   ```bash
   npx expo prebuild
   ```

   Sources:
   - https://docs.expo.dev/workflow/expo-cli/
   - https://docs.expo.dev/workflow/prebuild/
   - https://docs.expo.dev/guides/permissions/

5. Test on both platforms continuously.
   Local native runs:

   ```bash
   npx expo run:ios
   npx expo run:android
   ```

   Source:
   - https://docs.expo.dev/workflow/expo-cli/

## Why This Fits This App

This app concept likely needs:
- camera/photo capture
- file upload
- voice input/transcription
- API calls to a grading backend
- push or stateful feedback flows
- polished custom UI

`React Native + Expo` fits that well.

## When To Pick Something Else

- `Flutter`
  Best if the top priority is highly custom, animation-heavy, pixel-controlled UI and the team is comfortable with a different ecosystem.
  Source: https://docs.flutter.dev/

- `Swift + Kotlin`
  Best only if deep platform-specific behavior is required from day one.

## Recommendation

- Use the renders as design references, not as production code.
- Keep OCR, grading, transcription, and reasoning logic in backend services, not in the mobile app.

## Possible Next Step

If needed, this can be turned into:
- an Expo app folder structure
- a screen map
- a component inventory
- a phased implementation plan
- an API contract outline for grading, OCR, and transcription
