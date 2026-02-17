import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import WalletScreen from '../screens/Wallet/WalletScreen';
import RechargeScreen from '../screens/Wallet/RechargeScreen';
import TransactionsScreen from '../screens/Wallet/TransactionsScreen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Wallet: undefined;
  Recharge: undefined;
  Transactions: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen
              name="Recharge"
              component={RechargeScreen}
              options={{
                headerShown: true,
                title: 'Recharge Wallet',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="Transactions"
              component={TransactionsScreen}
              options={{
                headerShown: true,
                title: 'Transactions',
                headerBackTitle: 'Back',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default AppNavigator;
