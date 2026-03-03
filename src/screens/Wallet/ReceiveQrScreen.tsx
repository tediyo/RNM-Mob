import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import walletService from '../../services/wallet.service';

const ReceiveQrScreen = () => {
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [qrData, setQrData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const generateQr = async () => {
        if (!amount) {
            Alert.alert('Error', 'Please enter an amount');
            return;
        }
        setLoading(true);
        try {
            const data = await walletService.generateQr(parseFloat(amount), note);
            setQrData(data);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Receive Money</Text>
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
            <TouchableOpacity style={styles.button} onPress={generateQr} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate QR</Text>}
            </TouchableOpacity>

            {qrData && (
                <View style={styles.qrContainer}>
                    <QRCode
                        value={JSON.stringify({ p: qrData.payload, s: qrData.signature })}
                        size={200}
                    />
                    <Text style={styles.qrHint}>Ask the sender to scan this code</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15 },
    button: { width: '100%', height: 50, backgroundColor: '#007AFF', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    qrContainer: { marginTop: 40, alignItems: 'center' },
    qrHint: { marginTop: 20, color: '#666' },
});

export default ReceiveQrScreen;
