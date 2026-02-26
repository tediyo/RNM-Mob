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
  Modal,
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successAmount, setSuccessAmount] = useState(0);

  const parseAmount = () => {
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return null;
    }
    if (amountNum > 999999) {
      Alert.alert('Error', 'Amount must not exceed 999,999 ETB');
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

      const url =
        response?.data?.checkout_url ||
        response?.data?.data?.checkout_url ||
        response?.checkout_url ||
        response?.data?.mobile_url ||
        response?.mobile_url ||
        response?.url;

      const tx_ref = response?.tx_ref || response?.data?.tx_ref;

      if (url) {
        await WebBrowser.openBrowserAsync(url);

        // After browser closes, verify payment status
        if (tx_ref) {
          try {
            const verifyResponse = await paymentService.verifyChapaPayment(tx_ref);
            if (verifyResponse?.status === 'success') {
              setSuccessAmount(amountNum);
              setShowSuccessModal(true);
            } else {
              Alert.alert('Payment Pending', 'Your payment is being processed.');
              navigation.goBack();
            }
          } catch (verifyError: any) {
            Alert.alert('Status Unknown', 'Please check your balance shortly.');
            navigation.goBack();
          }
        }
      } else {
        Alert.alert('Error', 'Payment URL not found');
      }
    } catch (error: any) {
      Alert.alert('Payment Error', error?.message || 'Failed to start payment');
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
        return_url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT.CHAPA_SUCCESS}`,
      });

      const sessionId = response?.sessionId;

      if (response?.url) {
        await WebBrowser.openBrowserAsync(response.url);

        if (sessionId) {
          try {
            // Add a small delay for Stripe to process
            await new Promise(resolve => setTimeout(resolve, 1500));
            const verifyResponse = await paymentService.verifyStripePayment(sessionId);

            if (verifyResponse?.status === 'success') {
              setSuccessAmount(amountNum);
              setShowSuccessModal(true);
            } else {
              Alert.alert('Payment Pending', 'If you completed the payment, your balance will update shortly.');
              navigation.goBack();
            }
          } catch (verifyError: any) {
            Alert.alert('Status Unknown', 'Please check your balance shortly.');
            navigation.goBack();
          }
        }
      } else {
        Alert.alert('Error', 'Stripe checkout URL not found');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to start Stripe payment');
    } finally {
      setStripeLoading(false);
    }
  };

  const onSuccessClose = () => {
    setShowSuccessModal(false);
    // Navigate home and reset stack to ensure balance refresh
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
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

        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.successIconContainer}>
                <Text style={styles.successIconText}>✓</Text>
              </View>
              <Text style={styles.modalTitle}>Payment Successful!</Text>
              <Text style={styles.modalMessage}>
                Your wallet has been recharged with {successAmount} ETB.
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={onSuccessClose}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RechargeScreen;
