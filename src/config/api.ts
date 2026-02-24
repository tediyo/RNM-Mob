// API Configuration for Wallet Microservice
import { Platform } from 'react-native';

// IMPORTANT: For physical device testing, use your computer's IP address
// Your Wi-Fi IP: 192.168.0.117 (from ipconfig)
// For Android emulator, use: 10.0.2.2
// For iOS simulator, use: localhost

// Use this IP for physical device testing (Wi-Fi IP from ipconfig)
const DEVICE_IP = '192.168.0.117';

// Configure base URL based on platform
// Android emulator uses special IP 10.0.2.2 to reach host machine's localhost
// iOS simulator can use localhost directly
// Physical devices should use the DEVICE_IP (your computer's Wi-Fi IP)
const LOCAL_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'        // Android emulator -> host localhost
    : 'http://localhost:3000';       // iOS simulator -> host localhost

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
