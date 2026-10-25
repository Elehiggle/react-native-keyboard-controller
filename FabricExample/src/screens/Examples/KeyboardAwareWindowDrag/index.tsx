import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";

// Reproduction candidate, not yet verified. No focus, resize or reveal workaround.
export default function KeyboardAwareWindowDrag() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.root}>
      <Text style={styles.heading} testID="dre_dimensions">
        {`D-RE window drag — ${width.toFixed(1)} × ${height.toFixed(1)}`}
      </Text>
      <KeyboardAwareScrollView
        style={styles.scroll}
        bottomOffset={76}
        keyboardShouldPersistTaps="handled"
        testID="dre_scroll"
      >
        <Text>
          Focus the input, then move the free iPad window without resizing.
        </Text>
        <View style={{ height: height * 0.55 }} />
        <TextInput
          testID="dre_input"
          accessibilityLabel="Window drag input"
          placeholder="Type a short line"
          defaultValue="Window drag test"
          style={styles.input}
        />
        <View style={{ height: height * 0.65 }} />
      </KeyboardAwareScrollView>
      <KeyboardStickyView style={styles.sticky}>
        <View style={styles.footer} testID="dre_footer">
          <Text style={styles.footerText}>
            64 pt footer — input must stay above this
          </Text>
        </View>
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "white" },
  heading: { padding: 12, color: "black" },
  scroll: { flex: 1, paddingHorizontal: 16 },
  input: {
    height: 48,
    borderWidth: 2,
    borderColor: "#0057B8",
    paddingHorizontal: 12,
    color: "black",
  },
  sticky: { position: "absolute", bottom: 0, left: 0, right: 0 },
  footer: {
    height: 64,
    backgroundColor: "#146B3A",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { color: "white" },
});
