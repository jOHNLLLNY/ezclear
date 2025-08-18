import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../src/context/ThemeProvider";
import { soundUtils } from "../utils/sound-utils";

export function NotificationSettings() {
  const { colors, spacing, radius } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [testingSound, setTestingSound] = useState(false);

  const toggleSound = () => setSoundEnabled((v) => !v);

  const handleTestSound = () => {
    setTestingSound(true);
    soundUtils.testSound();
    setTimeout(() => setTestingSound(false), 1000);
  };

  return (
    <View style={{ gap: spacing[3] }}>
      <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.stroke, padding: spacing[3], borderRadius: radius.lg }]}>        
        <View style={styles.rowLeft}>
          <Ionicons name={soundEnabled ? "volume-high" : "volume-mute"} size={18} color={soundEnabled ? colors.primary : colors.textSecondary} />
          <Text style={{ color: colors.textPrimary, marginLeft: spacing[2] }}>Notification Sounds</Text>
        </View>
        <Switch value={soundEnabled} onValueChange={toggleSound} />
      </View>

      <View style={[styles.row, { justifyContent: "space-between" }]}>        
        <Text style={{ color: colors.textSecondary }}>
          {soundEnabled ? "Sound alerts are enabled for new notifications" : "Sound alerts are disabled"}
        </Text>
        <TouchableOpacity onPress={handleTestSound} disabled={!soundEnabled || testingSound} style={[styles.testBtn, { borderColor: colors.stroke }]}>          
          <Text style={{ color: colors.textPrimary }}>{testingSound ? "Playing..." : "Test Sound"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  testBtn: { paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderRadius: 10 },
});
