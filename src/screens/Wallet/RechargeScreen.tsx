import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { API_CONFIG } from '../../config/api';
import paymentService from '../../services/payment.service';

interface RechargeScreenProps {
  navigation: any;
}

const RechargeScreen: React.FC<RechargeScreenProps> = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [chapaLoading, setChapaLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);

  const parseAmount = () => {
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return null;
    }
    return amountNum;
  };

  const handleChapaMobile = async () => {
    const amountNum = parseAmount();
    if (!amountNum) return;

    setChapaLoading(true);
    try {
      const response = await paymentService.initializeChapaMobile({
        amount: amountNum,
        currency: 'ETB',
        callback_url: `${API_CONFIG.WEBHOOK_BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT.CHAPA_WEBHOOK}`,
        return_url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT.CHAPA_SUCCESS}`,
      });

      console.log('Full Chapa Response:', JSON.stringify(response, null, 2));

      // Try multiple possible response structures
      const url =
        response?.data?.checkout_url ||
        response?.data?.data?.checkout_url ||
        response?.checkout_url ||
        response?.data?.mobile_url ||
        response?.mobile_url ||
        response?.url;

      if (url) {
        console.log('Opening Chapa URL:', url);
        const result = await WebBrowser.openBrowserAsync(url);
        console.log('Browser result:', result);

        // After browser closes, verify payment status
        if (tx_ref) {
          console.log('Post-browser: Verifying payment for tx_ref:', tx_ref);
          try {
            const verifyResponse = await paymentService.verifyChapaPayment(tx_ref);
            console.log('Chapa verify result:', JSON.stringify(verifyResponse, null, 2));

            if (verifyResponse?.status === 'success') {
              Alert.alert(
                'Payment Successful',
                `Your wallet has been recharged with ${amountNum} ETB.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } else {
              console.log('Payment not yet success:', verifyResponse?.status);
              Alert.alert(
                'Payment Pending',
                'Your payment is being processed. Please check your balance shortly.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            }
          } catch (verifyError: any) {
            console.error('Chapa verify error details:', {
              message: verifyError.message,
              response: verifyError.response?.data,
            });
            Alert.alert(
              'Payment Status Unknown',
              'Payment may have been processed. Please refresh your wallet to check your balance.',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          }
        }
      } else {
        console.error('No URL found in response:', response);
        Alert.alert(
          'Error',
          'Payment URL not found in response. Response: ' + JSON.stringify(response),
        );
      }
    } catch (error: any) {
      console.error('Chapa error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to start Chapa payment. Please check your connection and try again.';

      Alert.alert('Payment Error', errorMessage);
    } finally {
      setChapaLoading(false);
    }
  };

  const handleStripe = async () => {
    const amountNum = parseAmount();
    if (!amountNum) return;

    setStripeLoading(true);
    try {
      const response = await paymentService.initializeStripe({
        amount: amountNum,
        currency: 'ETB',
      });

      const sessionId = response?.sessionId;

      if (response?.url) {
        const result = await WebBrowser.openBrowserAsync(response.url);
        console.log('Stripe browser result:', result);

        // After browser closes, verify the payment with the backend
        if (sessionId) {
          try {
            const verifyResponse = await paymentService.verifyStripePayment(sessionId);
            console.log('Stripe verify result:', JSON.stringify(verifyResponse, null, 2));

            if (verifyResponse?.status === 'success') {
              Alert.alert(
                'Payment Successful',
                `Your wallet has been recharged with ${amountNum} ETB.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } else {
              Alert.alert(
                'Payment Pending',
                'Your payment is being processed. Please check your balance shortly.',
                [{ text: 'OK' }]
              );
            }
          } catch (verifyError: any) {
            console.log('Stripe verify error:', verifyError.message);
            Alert.alert(
              'Payment Status Unknown',
              'Payment may have been processed. Please refresh your wallet to check your balance.',
              [{ text: 'OK' }]
            );
          }
        }
      } else {
        Alert.alert('Error', 'Stripe checkout URL not found');
      }
    } catch (error: any) {
      console.log(
        'Stripe error:',
        JSON.stringify(error?.response?.data || error, null, 2),
      );
      Alert.alert(
        'Error',
        error?.response?.data?.message ||
        JSON.stringify(
          error?.response?.data || error.message || 'Failed to start Stripe payment',
        ),
      );
    } finally {
      setStripeLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Recharge Wallet</Text>
        <Text style={styles.subtitle}>Enter the amount you want to add</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.currencyLabel}>ETB</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, chapaLoading && styles.buttonDisabled]}
          onPress={handleChapaMobile}
          disabled={chapaLoading || stripeLoading}
        >
          {chapaLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Pay with Chapa</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.stripeButton, stripeLoading && styles.buttonDisabled]}
          onPress={handleStripe}
          disabled={chapaLoading || stripeLoading}
        >
          {stripeLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.stripeButtonText}>Pay with Stripe</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 24,
  },
  currencyLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 24,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  stripeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  stripeButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RechargeScreen;
