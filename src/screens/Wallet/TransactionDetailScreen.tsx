import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { WalletTransaction } from '../../services/wallet.service';
import { useAuth } from '../../context/AuthContext';

interface TransactionDetailScreenProps {
  navigation: any;
  route: {
    params: {
      transaction: WalletTransaction;
    };
  };
}

const typeConfig: Record<string, { label: string; icon: string; color: string; bgColor: string }> = {
  recharge: { label: 'Wallet Recharge', icon: '💰', color: '#16a34a', bgColor: '#f0fdf4' },
  transfer: { label: 'Transfer', icon: '🔄', color: '#2563eb', bgColor: '#eff6ff' },
  bill: { label: 'Bill Payment', icon: '📄', color: '#dc2626', bgColor: '#fef2f2' },
};

const TransactionDetailScreen: React.FC<TransactionDetailScreenProps> = ({ route }) => {
  const { transaction } = route.params;
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const config = typeConfig[transaction.type] || typeConfig.recharge;

  const isCredit = transaction.type === 'recharge';
  const sign = isCredit ? '+' : transaction.type === 'bill' ? '-' : '';
  const amountStr = typeof transaction.amount === 'number'
    ? transaction.amount.toFixed(2)
    : '0.00';

  const formattedDate = new Date(transaction.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = new Date(transaction.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const generateInvoice = async () => {
    setDownloading(true);
    try {
      const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .logo { font-size: 28px; font-weight: bold; color: #007AFF; }
            .invoice-title { font-size: 32px; font-weight: bold; text-align: right; color: #999; }
            .details-container { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .detail-box h3 { font-size: 14px; text-transform: uppercase; color: #999; margin-bottom: 8px; }
            .detail-box p { font-size: 16px; margin: 0; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { text-align: left; padding: 12px; border-bottom: 2px solid #eee; color: #999; font-size: 14px; text-transform: uppercase; }
            td { padding: 20px 12px; border-bottom: 1px solid #eee; }
            .amount { font-size: 24px; font-weight: bold; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: center; }
            .stamp { width: 150px; height: 150px; border: 4px solid #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; transform: rotate(-15deg); color: #dc2626; font-size: 20px; font-weight: bold; text-transform: uppercase; opacity: 0.6; }
            .stamp-inner { border: 2px solid #dc2626; border-radius: 50%; width: 130px; height: 130px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .summary { text-align: right; }
            .summary-item { margin-bottom: 8px; font-size: 18px; }
            .total { font-size: 28px; font-weight: bold; color: #007AFF; border-top: 2px solid #007AFF; padding-top: 8px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">RNM WALLET</div>
            <div class="invoice-title">INVOICE</div>
          </div>
          
          <div class="details-container">
            <div class="detail-box">
              <h3>Billed To</h3>
              <p>${user?.name || 'Customer'}</p>
              <p style="font-size: 14px; color: #666;">${user?.email || ''}</p>
              <p style="font-size: 12px; color: #999;">ID: ${user?.id || ''}</p>
            </div>
            <div class="detail-box" style="text-align: right;">
              <h3>Invoice Date</h3>
              <p>${formattedDate}</p>
              <h3>Transaction ID</h3>
              <p style="font-family: monospace; font-size: 12px;">${transaction._id}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong style="font-size: 18px;">${config.label}</strong><br/>
                  <span style="color: #666; font-size: 14px;">${transaction.description || 'Wallet transaction'}</span>
                </td>
                <td style="text-align: right;" class="amount">
                  ${sign}${amountStr} ${transaction.currency || 'ETB'}
                </td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <div class="stamp">
              <div class="stamp-inner">
                <div>OFFICIAL</div>
                <div style="font-size: 12px; margin-top: 4px;">VERIFIED</div>
                <div style="font-size: 10px; margin-top: 4px;">${new Date().getFullYear()}</div>
              </div>
            </div>
            <div class="summary">
              <div class="summary-item">Subtotal: ${amountStr} ${transaction.currency || 'ETB'}</div>
              <div class="summary-item">Tax (0%): 0.00 ${transaction.currency || 'ETB'}</div>
              <div class="total">TOTAL: ${amountStr} ${transaction.currency || 'ETB'}</div>
            </div>
          </div>
          
          <div style="margin-top: 80px; text-align: center; color: #999; font-size: 12px;">
            Thank you for using RNM Wallet. This is a computer-generated invoice and does not require a signature.
          </div>
        </body>
      </html>
    `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to generate invoice: ' + error.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Download Button */}
      <TouchableOpacity
        style={[styles.downloadButton, downloading && styles.buttonDisabled]}
        onPress={() => generateInvoice()}
        disabled={downloading}
      >
        {downloading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.downloadButtonText}>Download Invoice</Text>
        )}
      </TouchableOpacity>

      {/* Status Badge */}
      <View style={[styles.statusCard, { backgroundColor: config.bgColor }]}>
        <Text style={styles.statusIcon}>{config.icon}</Text>
        <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
        <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
          <Text style={styles.statusBadgeText}>Completed</Text>
        </View>
      </View>

      {/* Amount Card */}
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount</Text>
        <Text style={[styles.amountValue, { color: isCredit ? '#16a34a' : '#dc2626' }]}>
          {sign}{amountStr}
        </Text>
        <Text style={styles.currencyLabel}>{transaction.currency ?? 'ETB'}</Text>
      </View>

      {/* Details Card */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Transaction Details</Text>

        <DetailRow label="Transaction ID" value={transaction._id} mono />
        <DetailRow label="Type" value={config.label} />
        <DetailRow label="Date" value={formattedDate} />
        <DetailRow label="Time" value={formattedTime} />

        {transaction.currency && (
          <DetailRow label="Currency" value={transaction.currency} />
        )}

        {typeof transaction.balanceAfter === 'number' && (
          <DetailRow
            label="Balance After"
            value={`${transaction.balanceAfter.toFixed(2)} ${transaction.currency ?? 'ETB'}`}
          />
        )}

        {transaction.description && (
          <DetailRow label="Description" value={transaction.description} />
        )}
      </View>

      {/* Additional Info Card (for bills/transfers) */}
      {(transaction.type === 'bill' || transaction.type === 'transfer') && (
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>
            {transaction.type === 'bill' ? 'Bill Information' : 'Transfer Information'}
          </Text>
          {transaction.type === 'transfer' && (
            <DetailRow label="Direction" value={isCredit ? 'Received' : 'Sent'} />
          )}
        </View>
      )}
    </ScrollView>
  );
};

const DetailRow = ({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text
      style={[styles.detailValue, mono && styles.monoValue]}
      numberOfLines={1}
      ellipsizeMode="middle"
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  statusCard: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  amountCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  amountLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 40,
    fontWeight: '800',
    marginBottom: 4,
  },
  currencyLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  monoValue: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#555',
  },
  downloadButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default TransactionDetailScreen;
