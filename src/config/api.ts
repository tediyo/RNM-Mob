// API Configuration for Wallet Microservice
import { Platform } from 'react-native';

// On Android emulator, localhost is 10.0.2.2 (host machine)
const LOCAL_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : 'http://localhost:3000';

export const API_CONFIG = {
  BASE_URL: __DEV__
    ? LOCAL_BASE_URL // Development
    : 'https://your-production-url.com', // Production URL

  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
    },
    WALLET: {
      GET_WALLET: '/wallet/me',
      RECHARGE: '/wallet/recharge',
      TRANSFER: '/wallet/transfer',
      PAY_BILL: '/wallet/pay-bill',
      TRANSACTIONS: '/wallet/transactions',
    },
  },
};

export default API_CONFIG;
