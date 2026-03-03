import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import walletService from '../../services/wallet.service';

const TransferScreen = ({ navigation }: any) => {
    const [phone, setPhone] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTransfer = async () => {
        if (!phone || !amount || !pin) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        setLoading(true);
        try {
            await walletService.transfer({
                phoneNumber: phone,
                amount: parseFloat(amount),
                pin,
                note,
                idempotencyKey: `TX-${Date.now()}`,
            });
            Alert.alert('Success', 'Transfer completed successfully', [
                { text: 'OK', onPress: () => navigation.navigate('Wallet') }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Send Money</Text>
            <TextInput
                style={styles.input}
                placeholder="Recipient Phone Number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
            />
            <TextInput
                style={styles.input}
                placeholder="Amount (ETB)"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
            />
            <TextInput
                style={styles.input}
                placeholder="Note (Optional)"
                value={note}
                onChangeText={setNote}
            />
            <TextInput
                style={styles.input}
                placeholder="Wallet PIN"
                keyboardType="numeric"
                secureTextEntry
                maxLength={6}
                value={pin}
                onChangeText={setPin}
            />
            <TouchableOpacity style={styles.button} onPress={handleTransfer} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Now</Text>}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15 },
    button: { width: '100%', height: 50, backgroundColor: '#007AFF', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default TransferScreen;
