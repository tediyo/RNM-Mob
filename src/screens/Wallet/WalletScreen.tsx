import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import walletService, { Wallet, WalletTransaction } from '../../services/wallet.service';
import { useAuth } from '../../context/AuthContext';

interface WalletScreenProps {
  navigation: any;
}

const formatAmount = (amount?: number) =>
  typeof amount === 'number' ? amount.toFixed(2) : '0.00';

const WalletScreen: React.FC<WalletScreenProps> = ({ navigation }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const { logout } = useAuth();

  // Refresh wallet data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadWalletData();
    }, [])
  );

  const loadWalletData = async () => {
    try {
      const [walletData, transactionsData] = await Promise.all([
        walletService.getWallet(),
        walletService.getTransactions(),
      ]);
      setWallet(walletData);
      setTransactions(transactionsData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load wallet data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle-outline" size={28} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <TouchableOpacity
            onPress={() => setShowBalance(!showBalance)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showBalance ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="rgba(255, 255, 255, 0.8)"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.balanceAmount}>
          {showBalance
            ? `${wallet?.balance?.toFixed(2) || '0.00'} ${wallet?.currency || 'ETB'}`
            : `•••••• ${wallet?.currency || 'ETB'}`}
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Recharge')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.actionButtonText}>Recharge</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ScanQr')}
        >
          <Ionicons name="scan-outline" size={24} color="#007AFF" />
          <Text style={styles.actionButtonText}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ReceiveQr')}
        >
          <Ionicons name="qr-code-outline" size={24} color="#007AFF" />
          <Text style={styles.actionButtonText}>Receive</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Transfer')}
        >
          <Ionicons name="send-outline" size={24} color="#007AFF" />
          <Text style={styles.actionButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.length === 0 ? (
          <Text style={styles.noTransactions}>No transactions yet</Text>
        ) : (
          transactions.slice(0, 5).map((transaction) => (
            <TouchableOpacity
              key={transaction._id}
              style={styles.transactionItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('TransactionDetail', { transaction })}
            >
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>
                  {transaction.description ?? transaction.type.toUpperCase()}
                </Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  transaction.direction === 'IN'
                    ? styles.creditAmount
                    : styles.debitAmount,
                ]}
              >
                {transaction.direction === 'IN' ? '+' : '-'}
                {formatAmount(transaction.amount)} {transaction.currency ?? 'ETB'}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  balanceCard: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  eyeButton: {
    padding: 4,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  actionButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  noTransactions: {
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  transactionItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  creditAmount: {
    color: '#34C759',
  },
  debitAmount: {
    color: '#FF3B30',
  },
});

export default WalletScreen;
