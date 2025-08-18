import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Switch, ActivityIndicator, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../src/context/ThemeProvider";

export function PushNotificationSettings() {
  const { colors, spacing, radius, typography } = useTheme();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync("push-enabled");
        if (saved != null) {
          if (!mounted) return;
          setEnabled(saved === "true");
          setLoading(false);
          return;
        }
        const perm = await Notifications.getPermissionsAsync();
        if (!mounted) return;
        setEnabled(perm.status === "granted");
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Failed to read permissions");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggle = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!enabled) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          setEnabled(false);
          await SecureStore.setItemAsync("push-enabled", "false");
          return;
        }
        // Optional: request push token; safe no-op without backend
        if (Platform.OS !== "web") {
          try {
            await Notifications.getExpoPushTokenAsync();
          } catch {}
        }
        setEnabled(true);
        await SecureStore.setItemAsync("push-enabled", "true");
      } else {
        // App-level toggle off (OS settings remain). Persist locally.
        setEnabled(false);
        await SecureStore.setItemAsync("push-enabled", "false");
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to update setting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container]}>
      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}
      <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.stroke, padding: spacing[3], borderRadius: radius.lg }]}>        
        <View style={styles.rowLeft}>
          <Ionicons name={enabled ? "notifications" : "notifications-off"} size={18} color={enabled ? colors.primary : colors.textSecondary} />
          <Text style={[styles.label, { color: colors.textPrimary, marginLeft: spacing[2] }]}>Push Notifications</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Switch value={enabled} onValueChange={toggle} />
        )}
      </View>
      <Text style={[styles.hint, { color: colors.textSecondary, marginTop: spacing[2] }]}>
        {enabled ? "You will receive notifications even when the app is closed" : "Enable to receive updates and job alerts"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1 },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  label: { fontSize: 16, fontWeight: "600" },
  hint: { fontSize: 12 },
  error: { fontSize: 12, marginBottom: 8 },
});
