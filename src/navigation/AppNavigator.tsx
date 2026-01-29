import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { Easing } from 'react-native';
import { MainScreen } from '../screens/MainScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { StudyScreen } from '../screens/StudyScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { CategoryDetailScreen } from '../screens/CategoryDetailScreen';

const Stack = createStackNavigator();

const smoothTransition = {
  animation: 'timing' as const,
  config: {
    duration: 320,
    easing: Easing.out(Easing.cubic),
  },
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          transitionSpec: {
            open: smoothTransition,
            close: smoothTransition,
          },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: '학습선택' }}
        />
        <Stack.Screen
          name="Study"
          component={StudyScreen}
          options={{ title: '학습' }}
        />
        <Stack.Screen
          name="Statistics"
          component={StatisticsScreen}
          options={{ title: '학습 통계' }}
        />
        <Stack.Screen
          name="CategoryDetail"
          component={CategoryDetailScreen}
          options={({ route }: any) => ({ title: route.params?.category || '상세' })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
