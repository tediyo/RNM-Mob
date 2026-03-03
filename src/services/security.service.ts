import apiService from './api';

class SecurityService {
    async setPin(pin: string): Promise<any> {
        try {
            const response = await apiService.getInstance().post('/security/pin/set', { pin });
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    async generateOtp(reason: string): Promise<any> {
        try {
            const response = await apiService.getInstance().post('/security/otp/generate', { reason });
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    private handleError(error: any): Error {
        if (error.response) {
            const message = error.response.data?.message || 'An error occurred';
            return new Error(message);
        } else {
            return new Error(error.message || 'An unexpected error occurred');
        }
    }
}

export const securityService = new SecurityService();
export default securityService;
