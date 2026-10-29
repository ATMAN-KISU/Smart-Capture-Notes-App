import React, { useState } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RecordsProvider } from './src/state/RecordsContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { CaptureScreen } from './src/screens/CaptureScreen';
import { DetailScreen } from './src/screens/DetailScreen';
import { Colors } from './src/theme/colors';

type NavigationRoute =
  | { name: 'home' }
  | { name: 'capture'; imageUri: string }
  | { name: 'detail'; recordId: string };

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<NavigationRoute>({ name: 'home' });

  const navigateToHome = () => {
    setCurrentRoute({ name: 'home' });
  };

  const navigateToCapture = (imageUri: string) => {
    setCurrentRoute({ name: 'capture', imageUri });
  };

  const navigateToDetail = (recordId: string) => {
    setCurrentRoute({ name: 'detail', recordId });
  };

  return (
    <SafeAreaProvider>
      <RecordsProvider>
        <View style={styles.root}>
          <View style={styles.deviceFrame}>
            <StatusBar style="light" />

            {currentRoute.name === 'home' && (
              <HomeScreen
                onOpenCapture={navigateToCapture}
                onOpenDetail={navigateToDetail}
              />
            )}

            {currentRoute.name === 'capture' && (
              <CaptureScreen
                initialImageUri={currentRoute.imageUri}
                onSaved={navigateToHome}
                onCancel={navigateToHome}
              />
            )}

            {currentRoute.name === 'detail' && (
              <DetailScreen
                recordId={currentRoute.recordId}
                onBack={navigateToHome}
                onDeleted={navigateToHome}
              />
            )}
          </View>
        </View>
      </RecordsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#040405',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceFrame: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    backgroundColor: Colors.background,
    ...Platform.select({
      web: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#1F1F24',
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.95)',
      },
      default: {},
    }),
  },
});
