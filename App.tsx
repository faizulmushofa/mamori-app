import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { InteractiveMap } from './components/InteractiveMap';

export default function App() {
  return (
    <View style={styles.container}>
      <InteractiveMap />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
