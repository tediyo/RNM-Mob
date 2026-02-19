import apiService from './api';
import API_CONFIG from '../config/api';

export interface InitializePaymentPayload {
  amount: number;
  currency: string;
  callback_url?: string;
  return_url?: string;
}

export interface InitializeStripePayload {
  amount: number;
  currency: string;
}

class PaymentService {
  async initializeChapaMobile(data: InitializePaymentPayload) {
    try {
      const response = await apiService
        .getInstance()
        .post(API_CONFIG.ENDPOINTS.PAYMENT.CHAPA_MOBILE, {
          amount: data.amount,
          currency: data.currency,
          callback_url: data.callback_url || 'https://example.com/payment/callback',
          return_url: data.return_url || 'https://example.com/payment/return',
        });
      
      console.log('Chapa Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('Chapa Payment Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw this.handleError(error);
    }
  }

  async initializeStripe(data: InitializeStripePayload) {
    try {
      const response = await apiService
        .getInstance()
        .post(API_CONFIG.ENDPOINTS.PAYMENT.STRIPE_INITIALIZE, {
          amount: data.amount,
          currency: data.currency,
        });
      
      console.log('Stripe Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('Stripe Payment Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || 'Payment initialization failed';
      return new Error(message);
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;

