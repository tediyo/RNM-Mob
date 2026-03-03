import apiService from './api';
import API_CONFIG from '../config/api';

export interface Wallet {
  _id: string;
  userId: string;
  balance: number;
  currency: string;
}

export interface RechargeData {
  amount: number;
  currency?: string;
}

export interface TransferData {
  toUserId?: string;
  phoneNumber?: string;
  amount: number;
  pin: string;
  note?: string;
  idempotencyKey?: string;
}

export interface PayBillData {
  billType: string;
  amount: number;
  currency?: string;
  billDetails?: any;
}

// Shape returned by backend wallet transactions API
export interface WalletTransaction {
  _id: string;
  type: 'recharge' | 'transfer' | 'bill';
  amount?: number;
  direction?: 'IN' | 'OUT';
  fromUser?: { _id: string; name: string; email: string };
  toUser?: { _id: string; name: string; email: string };
  // Optional / derived fields used by the UI
  currency?: string;
  description?: string;
  balanceAfter?: number;
  createdAt: string;
}

class WalletService {
  async getWallet(): Promise<Wallet> {
    try {
      const response = await apiService.getInstance().get<Wallet>(
        API_CONFIG.ENDPOINTS.WALLET.GET_WALLET
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async recharge(data: RechargeData): Promise<any> {
    try {
      const response = await apiService.getInstance().post(
        API_CONFIG.ENDPOINTS.WALLET.RECHARGE,
        {
          amount: data.amount,
          currency: data.currency || 'ETB',
        }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async transfer(data: TransferData): Promise<any> {
    try {
      const response = await apiService.getInstance().post(
        API_CONFIG.ENDPOINTS.WALLET.TRANSFER,
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async generateQr(amount: number, note?: string): Promise<any> {
    try {
      const response = await apiService.getInstance().post(
        '/wallet/qr/generate',
        { amount, note }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async scanQr(payload: string, signature: string, pin: string): Promise<any> {
    try {
      const response = await apiService.getInstance().post(
        '/wallet/qr/scan',
        { payload, signature, pin }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async payBill(data: PayBillData): Promise<any> {
    try {
      const response = await apiService.getInstance().post(
        API_CONFIG.ENDPOINTS.WALLET.PAY_BILL,
        {
          billType: data.billType,
          amount: data.amount,
          currency: data.currency || 'ETB',
          billDetails: data.billDetails,
        }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getTransactions(): Promise<WalletTransaction[]> {
    try {
      const response = await apiService.getInstance().get<WalletTransaction[]>(
        API_CONFIG.ENDPOINTS.WALLET.TRANSACTIONS
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export const walletService = new WalletService();
export default walletService;
