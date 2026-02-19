// API Configuration for Wallet Microservice
import { Platform } from 'react-native';

// IMPORTANT: For physical device testing, use your computer's IP address
// Your Wi-Fi IP: 192.168.0.143 (from ipconfig)
// For Android emulator, use: 10.0.2.2
// For iOS simulator, use: localhost

// Use this IP for physical device testing (Wi-Fi IP from ipconfig)
const DEVICE_IP = '192.168.0.143';

// Configure base URL based on platform
// Android emulator uses 10.0.2.2, physical devices use DEVICE_IP
// iOS simulator uses localhost, physical devices use DEVICE_IP
const LOCAL_BASE_URL =
  Platform.OS === 'android'
    ? `http://${DEVICE_IP}:3000` // Use DEVICE_IP for both emulator and physical device
    : `http://${DEVICE_IP}:3000`; // Use DEVICE_IP for both simulator and physical device

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
    PAYMENT: {
      CHAPA_INITIALIZE: '/payment/initialize',
      CHAPA_MOBILE: '/payment/initialize-mobile',
      CHAPA_VERIFY: '/payment/verify',
      STRIPE_INITIALIZE: '/payment/stripe/initialize',
      STRIPE_VERIFY: '/payment/stripe/verify',
    },
  },
};

export default API_CONFIG;
