import React, { useEffect, useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { OverKeyboardView } from "react-native-keyboard-controller";

// Standalone candidate: no app patch, gesture-handler, modal or custom provider.
export default function OverKeyboardWindowRepro() {
  const [visible, setVisible] = useState(false);
  const [presses, setPresses] = useState(0);
  const [touches, setTouches] = useState({ starts: 0, moves: 0, ends: 0 });
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setVisible(true),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  const record = (kind: "starts" | "moves" | "ends") => {
    setTouches((value) => ({ ...value, [kind]: value[kind] + 1 }));
    console.log("OKV_REPRO", kind, Date.now());
  };

  return (
    <View style={styles.screen}>
      <Text>Focus input, then tile this window on the right.</Text>
      <TextInput
        testID="okv-window.input"
        placeholder="Open the software keyboard"
        style={styles.input}
      />
      <Text testID="okv-window.result">
        Presses {presses}; touch starts {touches.starts}, moves {touches.moves},
        ends {touches.ends}
      </Text>
      <OverKeyboardView visible={visible}>
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <View
            style={styles.panel}
            testID="okv-window.panel"
            collapsable={false}
          >
            <Text>Panel: local x=12, y=160</Text>
            <Pressable
              accessibilityRole="button"
              testID="okv-window.increment"
              onTouchStart={() => record("starts")}
              onTouchMove={() => record("moves")}
              onTouchEnd={() => record("ends")}
              onPress={() => {
                setPresses((value) => value + 1);
                console.log("OKV_REPRO", "press", Date.now());
              }}
              style={styles.button}
            >
              <Text>Increment: {presses}</Text>
            </Pressable>
          </View>
        </View>
      </OverKeyboardView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 12, backgroundColor: "#ffffff" },
  input: { height: 48, borderWidth: 1, padding: 8, marginVertical: 8 },
  panel: {
    position: "absolute",
    left: 12,
    top: 160,
    width: 220,
    padding: 12,
    backgroundColor: "#ffd166",
    borderWidth: 2,
  },
  button: {
    height: 56,
    marginTop: 8,
    backgroundColor: "#8ed1fc",
    alignItems: "center",
    justifyContent: "center",
  },
});
