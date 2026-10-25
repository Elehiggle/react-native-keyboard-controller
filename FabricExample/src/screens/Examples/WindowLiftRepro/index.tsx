import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Dimensions,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  KeyboardController,
  KeyboardEvents,
  KeyboardStickyView,
  useKeyboardState,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import { runOnJS, useAnimatedReaction } from "react-native-reanimated";

import type { KeyboardEvent } from "react-native";

export default function WindowLiftRepro() {
  const root = useRef<View>(null);
  const input = useRef<TextInput>(null);
  const raw = useRef<KeyboardEvent | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const state = useKeyboardState();
  const { height, progress } = useReanimatedKeyboardAnimation();
  const [animated, setAnimated] = useState({ height: 0, progress: 0 });

  const record = (value: unknown) => {
    const line = JSON.stringify({ at: Date.now(), value });

    console.log("WINDOW_LIFT_REPRO", line);
    setLines((previous) => [...previous.slice(-9), line]);
  };

  useAnimatedReaction(
    () => ({ height: height.value, progress: progress.value }),
    (value, previous) => {
      if (
        !previous ||
        Math.abs(value.height - previous.height) > 0.5 ||
        value.progress !== previous.progress
      ) {
        runOnJS(setAnimated)(value);
      }
    },
  );

  useEffect(() => {
    const rn = [
      Keyboard.addListener("keyboardDidShow", (event) => {
        raw.current = event;
        record({ source: "RN DidShow (window coordinates)", event });
      }),
      Keyboard.addListener("keyboardDidChangeFrame", (event) => {
        raw.current = event;
        record({ source: "RN DidChangeFrame (window coordinates)", event });
      }),
      Keyboard.addListener("keyboardDidHide", () => {
        raw.current = null;
        record({ source: "RN DidHide" });
      }),
    ];
    const kc = [
      KeyboardEvents.addListener("keyboardWillShow", (event) =>
        record({ source: "RNKC WillShow", event }),
      ),
      KeyboardEvents.addListener("keyboardDidShow", (event) =>
        record({ source: "RNKC DidShow", event }),
      ),
      KeyboardEvents.addListener("keyboardDidHide", (event) =>
        record({ source: "RNKC DidHide", event }),
      ),
    ];

    return () =>
      [...rn, ...kc].forEach((subscription) => subscription.remove());
  }, []);

  const capture = () => {
    root.current?.measureInWindow((x, y, width, height) => {
      const coordinates = raw.current?.endCoordinates;
      const horizontal = coordinates
        ? coordinates.screenX + coordinates.width > x &&
          coordinates.screenX < x + width
        : false;
      // RN converts these coordinates to the app window. This is only a
      // fresh-notification reference, not a live native geometry measurement.
      const reference =
        coordinates && horizontal
          ? Math.min(height, Math.max(0, y + height - coordinates.screenY))
          : 0;

      record({
        source: "capture",
        rootInWindow: { x, y, width, height },
        dimensions: {
          window: Dimensions.get("window"),
          screen: Dimensions.get("screen"),
        },
        lastRNFrame: coordinates,
        referenceFromLastRNFrame: reference,
        state: KeyboardController.state(),
        isVisible: KeyboardController.isVisible(),
        animated,
      });
    });
  };

  return (
    <View ref={root} collapsable={false} style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Window lift / #1680</Text>
        <View testID="window-lift.values">
          <Text testID="window-lift.state">
            State: {String(state.isVisible)} / {state.height.toFixed(1)}
          </Text>
          <Text testID="window-lift.provider">
            Provider: {animated.height.toFixed(1)} / progress{" "}
            {animated.progress.toFixed(2)}
          </Text>
        </View>
        <Text>
          Keep the docked keyboard open. Move the window; wait 5 seconds.
        </Text>
        <Button
          testID="window-lift.capture"
          title="Capture (no refocus)"
          onPress={capture}
        />
        <Button
          testID="window-lift.focus"
          title="Fresh open control"
          onPress={() => input.current?.focus()}
        />
        <Button
          testID="window-lift.hide"
          title="Hide keyboard"
          onPress={() => Keyboard.dismiss()}
        />
      </View>
      <ScrollView style={styles.log} keyboardShouldPersistTaps="always">
        <Text testID="window-lift.log" selectable style={styles.logText}>
          {lines.join("\n")}
        </Text>
      </ScrollView>
      <KeyboardStickyView style={styles.footer}>
        <Text>
          Sticky bottom must meet the keyboard, or stay at the window bottom.
        </Text>
        <TextInput
          ref={input}
          testID="window-lift.input"
          placeholder="Focus, then move the window"
          style={styles.input}
        />
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 16, paddingTop: 44, backgroundColor: "#eef3ff" },
  title: { fontSize: 20, fontWeight: "600" },
  log: { flex: 1, margin: 12, marginBottom: 100 },
  logText: { fontSize: 11, color: "#222" },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: "#b5f5cc",
  },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#fff",
    minHeight: 44,
    padding: 8,
  },
});
