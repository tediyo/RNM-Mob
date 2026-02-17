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
  recipientEmail: string;
  amount: number;
  currency?: string;
}

export interface PayBillData {
  billType: string;
  amount: number;
  currency?: string;
  billDetails?: any;
}

export interface WalletTransaction {
  _id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  balanceAfter: number;
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
        {
          recipientEmail: data.recipientEmail,
          amount: data.amount,
          currency: data.currency || 'ETB',
        }
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
