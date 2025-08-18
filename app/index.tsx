import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0A0B' }}>
        <ActivityIndicator size="large" color="#00E6CF" />
      </View>
    );
  }

  return isAuthenticated ? (
    <Redirect href="/(tabs)/home" />
  ) : (
    <Redirect href="/(auth)/welcome" />
  );
}
