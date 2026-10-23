import React, { useEffect, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import {
  KeyboardEvents,
  KeyboardStickyView,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import { runOnJS, useAnimatedReaction } from "react-native-reanimated";

export default function KeyboardStickyViewRotation() {
  const { width, height: windowHeight } = useWindowDimensions();
  const { height, progress } = useReanimatedKeyboardAnimation();
  const [animated, setAnimated] = useState({ height: 0, progress: 0 });
  const [didShow, setDidShow] = useState(0);
  const [rnFrame, setRnFrame] = useState("-");

  useAnimatedReaction(
    () => ({ height: -height.value, progress: progress.value }),
    (current) => {
      runOnJS(setAnimated)(current);
    },
  );

  useEffect(() => {
    const shown = KeyboardEvents.addListener("keyboardDidShow", (e) =>
      setDidShow(e.height),
    );
    // the frame UIKit sent, as React Native reports it
    const frame = Keyboard.addListener("keyboardDidChangeFrame", (e) => {
      const { screenY, width: w, height: h } = e.endCoordinates;

      setRnFrame(`y ${screenY}, ${w} x ${h}`);
    });

    return () => {
      shown.remove();
      frame.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label} testID="keyboard_values">
        {`window: ${width} x ${windowHeight}\n` +
          `height: ${animated.height.toFixed(
            2,
          )}, progress: ${animated.progress.toFixed(2)}\n` +
          `keyboardDidShow: ${didShow}\n` +
          `RN keyboardDidChangeFrame: ${rnFrame}`}
      </Text>
      <Text style={styles.hint}>
        Focus the input and rotate the device with the keyboard open. The input
        should stay right above the keyboard.
      </Text>
      <View style={styles.spacer} />
      <KeyboardStickyView>
        <TextInput
          placeholder="Message"
          placeholderTextColor="#8E8E93"
          style={styles.input}
          testID="sticky_input"
        />
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    marginTop: 16,
    marginHorizontal: 16,
    fontSize: 16,
    fontVariant: ["tabular-nums"],
  },
  hint: {
    marginTop: 12,
    marginHorizontal: 16,
    color: "#8E8E93",
  },
  spacer: {
    flex: 1,
  },
  input: {
    height: 50,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#E5E5EA",
  },
});
