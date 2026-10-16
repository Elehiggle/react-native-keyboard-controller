import * as React from "react";
import {
  Button,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardProvider,
} from "react-native-keyboard-controller";

function Repro() {
  const title = React.useRef<TextInput>(null);
  const notes = React.useRef<TextInput>(null);
  const [focused, setFocused] = React.useState("title");
  const bottomOffset = focused === "notes" ? 180 : 60;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.heading}>Dynamic bottomOffset</Text>
        <View style={styles.actions}>
          <Button
            testID="focus-title"
            title="Focus title"
            onPress={() => title.current?.focus()}
          />
          <Button
            testID="focus-notes"
            title="Focus notes"
            onPress={() => notes.current?.focus()}
          />
        </View>
        <Text testID="offset">bottomOffset = {bottomOffset}</Text>
      </View>
      <KeyboardAwareScrollView
        bottomOffset={bottomOffset}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="always"
        testID="form"
      >
        <Text>Title</Text>
        <TextInput
          ref={title}
          defaultValue="A short title"
          style={styles.title}
          testID="title-input"
          onFocus={() => setFocused("title")}
        />
        <View style={styles.spacer} />
        <View style={styles.notesCard}>
          <Text>Notes</Text>
          <TextInput
            ref={notes}
            multiline
            defaultValue="Some notes"
            style={styles.notes}
            testID="notes-input"
            onFocus={() => setFocused("notes")}
          />
          <Text>Actions below the notes need extra clearance.</Text>
        </View>
        <View style={styles.tail} />
      </KeyboardAwareScrollView>
    </View>
  );
}

export default function App() {
  return (
    <KeyboardProvider>
      <Repro />
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f2f2f2", paddingTop: 32 },
  header: { paddingHorizontal: 16, paddingBottom: 12, gap: 4 },
  heading: { fontSize: 20, fontWeight: "600" },
  actions: { flexDirection: "row", justifyContent: "space-between" },
  content: { padding: 20 },
  title: {
    backgroundColor: "white",
    borderWidth: 1,
    padding: 12,
    fontSize: 18,
  },
  spacer: { height: 380 },
  notesCard: { backgroundColor: "white", borderWidth: 2, padding: 12 },
  notes: { height: 112, padding: 8, fontSize: 18, textAlignVertical: "top" },
  tail: { height: 400 },
});
