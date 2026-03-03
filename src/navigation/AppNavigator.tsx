import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import WalletScreen from '../screens/Wallet/WalletScreen';
import RechargeScreen from '../screens/Wallet/RechargeScreen';
import TransactionsScreen from '../screens/Wallet/TransactionsScreen';
import TransactionDetailScreen from '../screens/Wallet/TransactionDetailScreen';
import ReceiveQrScreen from '../screens/Wallet/ReceiveQrScreen';
import TransferScreen from '../screens/Wallet/TransferScreen';
import ScanQrScreen from '../screens/Wallet/ScanQrScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Wallet: undefined;
  Recharge: undefined;
  Transactions: undefined;
  TransactionDetail: { transaction: any };
  ReceiveQr: undefined;
  Transfer: undefined;
  ScanQr: undefined;
  Profile: undefined;
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
            <Stack.Screen
              name="TransactionDetail"
              component={TransactionDetailScreen}
              options={{
                headerShown: true,
                title: 'Transaction Details',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="ReceiveQr"
              component={ReceiveQrScreen}
              options={{
                headerShown: true,
                title: 'Receive Money',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="Transfer"
              component={TransferScreen}
              options={{
                headerShown: true,
                title: 'Send Money',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="ScanQr"
              component={ScanQrScreen}
              options={{
                headerShown: true,
                title: 'Scan & Pay',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerShown: true,
                title: 'My Profile',
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
