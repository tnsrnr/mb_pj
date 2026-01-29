import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export const MainScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="book" size={64} color="#2196F3" />
        <Text style={styles.title}>정보관리기술사</Text>
        <Text style={styles.subtitle}>학습 앱</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Settings' as never)}
        >
          <Ionicons name="play-circle" size={32} color="#fff" />
          <Text style={styles.buttonText}>학습 시작</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Statistics' as never)}
        >
          <Ionicons name="stats-chart" size={24} color="#2196F3" />
          <Text style={styles.secondaryButtonText}>학습 통계</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>장순국 Android Edition v1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    padding: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
});
