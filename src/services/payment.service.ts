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
    const response = await apiService
      .getInstance()
      .post(`${API_CONFIG.ENDPOINTS.PAYMENT?.CHAPA_MOBILE ?? '/payment/initialize-mobile'}`, data);
    return response.data;
  }

  async initializeStripe(data: InitializeStripePayload) {
    const response = await apiService
      .getInstance()
      .post(`${API_CONFIG.ENDPOINTS.PAYMENT?.STRIPE_INITIALIZE ?? '/payment/stripe/initialize'}`, data);
    return response.data;
  }
}

export const paymentService = new PaymentService();
export default paymentService;

