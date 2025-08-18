/**
 * Simple Root Navigator for Testing
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function TestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>EZ Clear App is Working!</Text>
      <Text style={styles.subtext}>Navigation system loaded successfully</Text>
    </View>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Test" component={TestScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
  },
});
