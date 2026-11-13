import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

// Repro for #1665: no TextInput on this screen, so the keyboard is never shown.
// Pick a case, drag the list once and let it settle (B: scroll to the very end),
// then go to the Home screen and reopen the app. The offset should not change.
// The drag matters: the component reads layout and content size from native
// scroll events, so without one it sees zeros and does not scroll.
const CASES = {
  // content shorter than the viewport, rest offset = -top inset
  A: { rows: 5, insets: "automatic" },
  // long content, scroll to the very end by hand
  B: { rows: 30, insets: "automatic" },
  // control: like A, but no automatic insets, rest offset = 0
  C: { rows: 5, insets: "never" },
} as const;

type Case = keyof typeof CASES;

const ROW_HEIGHT = 60;

export default function Issue1665() {
  const [current, setCurrent] = useState<Case>("A");
  const [offset, setOffset] = useState(0);
  const [layout, setLayout] = useState(0);
  const [content, setContent] = useState(0);
  const { rows, insets } = CASES[current];
  const y = offset.toFixed(1);
  const info = `${current} y=${y} layout=${layout} content=${content}`;

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        key={current}
        contentInsetAdjustmentBehavior={insets}
        scrollEventThrottle={16}
        testID="issue_1665_scroll"
        onContentSizeChange={(_, h) => setContent(h)}
        onLayout={(e) => setLayout(e.nativeEvent.layout.height)}
        onScroll={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;

          console.log(`[1665] case ${current} offset ${offsetY}`);
          setOffset(offsetY);
        }}
      >
        {Array.from({ length: rows }, (_, i) => (
          <View key={i} style={[styles.row, i % 2 === 1 && styles.rowOdd]}>
            <Text style={styles.rowText}>
              {i === rows - 1 ? `Row ${i + 1} (last)` : `Row ${i + 1}`}
            </Text>
          </View>
        ))}
      </KeyboardAwareScrollView>
      <View pointerEvents="box-none" style={styles.panel}>
        <View style={styles.buttons}>
          {(Object.keys(CASES) as Case[]).map((c) => (
            <Pressable
              key={c}
              style={[styles.button, c === current && styles.buttonActive]}
              testID={`issue_1665_case_${c}`}
              onPress={() => setCurrent(c)}
            >
              <Text style={styles.buttonText}>{c}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.info} testID="issue_1665_info">
          {info}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  row: {
    height: ROW_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#e3f2fd",
  },
  rowOdd: {
    backgroundColor: "#ffe0b2",
  },
  rowText: {
    fontSize: 18,
    color: "black",
  },
  panel: {
    position: "absolute",
    top: "45%",
    left: 16,
    right: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  buttons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  button: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#555",
  },
  buttonActive: {
    backgroundColor: "#1e88e5",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  info: {
    color: "white",
    fontFamily: "Menlo",
    fontSize: 13,
  },
});
