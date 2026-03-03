import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import walletService from '../../services/wallet.service';

const ScanQrScreen = ({ navigation }: any) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [qrData, setQrData] = useState<any>(null);
    const [pin, setPin] = useState('');
    const [pinModalVisible, setPinModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!permission) requestPermission();
    }, []);

    const handleBarCodeScanned = ({ data }: any) => {
        if (scanned) return;
        setScanned(true);
        try {
            const parsed = JSON.parse(data);
            if (parsed.p && parsed.s) {
                setQrData(parsed);
                setPinModalVisible(true);
            } else {
                throw new Error('Invalid QR code format');
            }
        } catch (error) {
            Alert.alert('Error', 'Invalid QR code scanned');
            setScanned(false);
        }
    };

    const confirmPayment = async () => {
        if (!pin) {
            Alert.alert('Error', 'Please enter your PIN');
            return;
        }
        setLoading(true);
        try {
            await walletService.scanQr(qrData.p, qrData.s, pin);
            setPinModalVisible(false);
            Alert.alert('Success', 'Payment completed successfully', [
                { text: 'OK', onPress: () => navigation.navigate('Wallet') }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message);
            setScanned(false);
            setPinModalVisible(false);
        } finally {
            setLoading(false);
        }
    };

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.button}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeSettings={{
                    barcodeTypes: ['qr'],
                }}
            />
            {scanned && (
                <TouchableOpacity style={styles.rescanButton} onPress={() => setScanned(false)}>
                    <Text style={styles.buttonText}>Tap to Scan Again</Text>
                </TouchableOpacity>
            )}

            <Modal visible={pinModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirm Payment</Text>
                        <Text style={styles.modalLabel}>Enter your Wallet PIN</Text>
                        <TextInput
                            style={styles.pinInput}
                            keyboardType="numeric"
                            secureTextEntry
                            maxLength={6}
                            value={pin}
                            onChangeText={setPin}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => { setPinModalVisible(false); setScanned(false); }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={confirmPayment}
                                disabled={loading}
                            >
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmButtonText}>Confirm</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    button: { padding: 15, backgroundColor: '#007AFF', borderRadius: 8, marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 16, textAlign: 'center' },
    rescanButton: { position: 'absolute', bottom: 50, left: 20, right: 20, padding: 15, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    modalLabel: { fontSize: 16, color: '#666', marginBottom: 10 },
    pinInput: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, textAlign: 'center', fontSize: 24, marginBottom: 20 },
    modalButtons: { flexDirection: 'row', gap: 10 },
    modalButton: { flex: 1, height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    cancelButton: { backgroundColor: '#eee' },
    confirmButton: { backgroundColor: '#007AFF' },
    cancelButtonText: { color: '#666', fontWeight: 'bold' },
    confirmButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default ScanQrScreen;
