import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import type { KeyboardAwareScrollViewRef } from "react-native-keyboard-controller";

const BOTTOM_OFFSET = 24;

// Natural-rotation candidate. No forced scroll or artificial layout delay.
export default function KASVRealignmentRepro() {
  const scroll = useRef<KeyboardAwareScrollViewRef>(null);
  const input = useRef<TextInput>(null);
  const viewport = useRef<View>(null);
  const offset = useRef(0);
  const { width, height } = useWindowDimensions();
  const [reading, setReading] = useState(
    "Focus field; rotate; wait 10 seconds.",
  );
  const measure = useCallback(
    async (reason: string) => {
      const keyboard = Keyboard.metrics();

      if (!keyboard) {
        setReading(
          `${reason}: no RN keyboard metrics; verify keyboard visually.`,
        );

        return;
      }
      const scrollViewport = viewport.current;
      const field = input.current;

      if (!scrollViewport || !field) {
        return;
      }
      await new Promise<void>((resolve) => {
        scrollViewport.measureInWindow((_vx, vy, _vw, vh) => {
          field.measureInWindow((_x, y, _w, h) => {
            const end = y + h;
            const target = keyboard.screenY - BOTTOM_OFFSET;
            const gap = target - end;
            const visible =
              end >= vy && end <= Math.min(vy + vh, keyboard.screenY);
            const result = {
              reason,
              time: Date.now(),
              width,
              height,
              scrollY: offset.current,
              viewportTop: vy,
              viewportBottom: vy + vh,
              keyboardTop: keyboard.screenY,
              inputEnd: end,
              target,
              gap,
              visible,
            };

            console.log("KASV_REALIGN_REPRO", JSON.stringify(result));
            setReading(
              `scroll=${offset.current.toFixed(1)} end=${end.toFixed(
                1,
              )} target=${target.toFixed(1)} boxGap=${gap.toFixed(
                1,
              )} visible=${visible}`,
            );
            resolve();
          });
        });
      });
    },
    [width, height],
  );

  useEffect(() => {
    const timers = [1000, 5000, 10000].map((delay) =>
      setTimeout(() => measure(`layout+${delay}`), delay),
    );

    return () => timers.forEach(clearTimeout);
  }, [measure]);

  return (
    <View style={styles.screen}>
      <View style={styles.controls}>
        <View style={styles.summary}>
          <Text style={styles.reading}>
            bottomOffset={BOTTOM_OFFSET}; {width} x {height}
          </Text>
          <Text
            numberOfLines={3}
            style={styles.reading}
            testID="kasv-realign.metrics"
          >
            {reading}
          </Text>
        </View>
        <View style={styles.synchronize}>
          <Button
            testID="kasv-realign.synchronize"
            title="synchronize()"
            onPress={async () => {
              await measure("before synchronize");
              scroll.current?.assureFocusedInputVisible();
              setTimeout(() => measure("after synchronize+1000"), 1000);
              setTimeout(() => measure("after synchronize+3000"), 3000);
            }}
          />
        </View>
      </View>
      <View
        ref={viewport}
        collapsable={false}
        style={styles.viewport}
        testID="kasv-realign.viewport"
      >
        <KeyboardAwareScrollView
          ref={scroll}
          bottomOffset={BOTTOM_OFFSET}
          keyboardShouldPersistTaps="always"
          scrollEventThrottle={16}
          testID="kasv-realign.scroll"
          onScroll={(event) => {
            offset.current = event.nativeEvent.contentOffset.y;
          }}
        >
          <View style={styles.before}>
            <Text>Fixed spacer: 650 pt</Text>
          </View>
          <Text>
            Single-line target (red border = box-end proxy, not caret)
          </Text>
          <TextInput
            ref={input}
            defaultValue="Rotation alignment target"
            style={styles.input}
            testID="kasv-realign.input"
            onFocus={() => {
              setTimeout(() => measure("focus+1500"), 1500);
            }}
          />
          <View style={styles.after}>
            <Text>Trailing space: 400 pt (avoids content-end clamp)</Text>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#ffffff" },
  controls: {
    height: 56,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summary: { flex: 1, minWidth: 0 },
  synchronize: { width: 136 },
  reading: { fontSize: 10, lineHeight: 12 },
  viewport: { flex: 1 },
  before: { height: 650, backgroundColor: "#eeeeee" },
  input: {
    height: 44,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderBottomColor: "red",
    padding: 8,
  },
  after: { height: 400, backgroundColor: "#e8f5e9" },
});
