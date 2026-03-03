import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import securityService from '../../services/security.service';
import walletService from '../../services/wallet.service';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    balance: number;
    hasPinSet: boolean;
}

const ProfileScreen = ({ navigation }: any) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Editable fields
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [saving, setSaving] = useState(false);

    // PIN fields
    const [showPinSection, setShowPinSection] = useState(false);
    const [newPin, setNewPin] = useState('');
    const [oldPin, setOldPin] = useState('');
    const [pinSaving, setPinSaving] = useState(false);

    // QR
    const [qrData, setQrData] = useState<any>(null);
    const [qrLoading, setQrLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, [])
    );

    const loadProfile = async () => {
        try {
            const response = await apiService.getInstance().get('/auth/profile');
            const data = response.data;
            setProfile(data);
            setName(data.name);
            setPhone(data.phoneNumber || '');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const response = await apiService.getInstance().patch('/auth/profile', {
                name: name.trim(),
                phoneNumber: phone.trim() || undefined,
            });
            setProfile(response.data);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleSetOrChangePin = async () => {
        if (!newPin || newPin.length < 4) {
            Alert.alert('Error', 'PIN must be 4-6 digits');
            return;
        }
        setPinSaving(true);
        try {
            if (profile?.hasPinSet) {
                // Change PIN
                if (!oldPin) {
                    Alert.alert('Error', 'Please enter your current PIN');
                    setPinSaving(false);
                    return;
                }
                await apiService.getInstance().post('/security/pin/change', {
                    oldPin,
                    newPin,
                });
            } else {
                // Set PIN
                await securityService.setPin(newPin);
            }
            Alert.alert('Success', profile?.hasPinSet ? 'PIN changed successfully' : 'PIN set successfully');
            setOldPin('');
            setNewPin('');
            setShowPinSection(false);
            loadProfile(); // Refresh to update hasPinSet
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to set PIN');
        } finally {
            setPinSaving(false);
        }
    };

    const handleGenerateMyQr = async () => {
        setQrLoading(true);
        try {
            // Generate a personal QR (amount 0 means "any amount")
            const data = await walletService.generateQr(0, `Pay ${profile?.name}`);
            setQrData(data);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to generate QR');
        } finally {
            setQrLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={48} color="#fff" />
                </View>
                <Text style={styles.emailText}>{profile?.email}</Text>
            </View>

            {/* Profile Fields */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <Text style={styles.label}>Name</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} />

                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="e.g. +251912345678"
                    keyboardType="phone-pad"
                />

                <TouchableOpacity style={styles.primaryButton} onPress={handleSaveProfile} disabled={saving}>
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Save Changes</Text>}
                </TouchableOpacity>
            </View>

            {/* PIN Management */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Wallet PIN</Text>
                <Text style={styles.statusText}>
                    Status: {profile?.hasPinSet ? '✅ PIN is set' : '❌ No PIN set'}
                </Text>

                {!showPinSection ? (
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => setShowPinSection(true)}
                    >
                        <Ionicons name="lock-closed-outline" size={18} color="#007AFF" />
                        <Text style={styles.secondaryButtonText}>
                            {profile?.hasPinSet ? 'Change PIN' : 'Set PIN'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View>
                        {profile?.hasPinSet && (
                            <>
                                <Text style={styles.label}>Current PIN</Text>
                                <TextInput
                                    style={styles.input}
                                    value={oldPin}
                                    onChangeText={setOldPin}
                                    secureTextEntry
                                    keyboardType="numeric"
                                    maxLength={6}
                                    placeholder="Enter current PIN"
                                />
                            </>
                        )}
                        <Text style={styles.label}>New PIN</Text>
                        <TextInput
                            style={styles.input}
                            value={newPin}
                            onChangeText={setNewPin}
                            secureTextEntry
                            keyboardType="numeric"
                            maxLength={6}
                            placeholder="Enter new 4-6 digit PIN"
                        />
                        <View style={styles.rowButtons}>
                            <TouchableOpacity
                                style={[styles.secondaryButton, { flex: 1 }]}
                                onPress={() => { setShowPinSection(false); setOldPin(''); setNewPin(''); }}
                            >
                                <Text style={styles.secondaryButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.primaryButton, { flex: 1 }]}
                                onPress={handleSetOrChangePin}
                                disabled={pinSaving}
                            >
                                {pinSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Confirm</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            {/* My QR Code */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>My QR Code</Text>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('ReceiveQr')}>
                    <Ionicons name="qr-code-outline" size={18} color="#007AFF" />
                    <Text style={styles.secondaryButtonText}>Generate Payment QR</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    content: { paddingBottom: 40 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    avatarContainer: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#007AFF' },
    avatar: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 10,
    },
    emailText: { color: '#fff', fontSize: 16, opacity: 0.9 },
    section: {
        backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16,
        borderRadius: 12, padding: 16,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 },
    label: { fontSize: 14, color: '#666', marginBottom: 4, marginTop: 12 },
    input: {
        height: 48, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
        paddingHorizontal: 14, fontSize: 16, backgroundColor: '#fafafa',
    },
    statusText: { fontSize: 15, color: '#555', marginBottom: 10 },
    primaryButton: {
        marginTop: 16, height: 48, backgroundColor: '#007AFF', borderRadius: 8,
        justifyContent: 'center', alignItems: 'center',
    },
    primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    secondaryButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        height: 48, borderWidth: 1, borderColor: '#007AFF', borderRadius: 8, gap: 8,
    },
    secondaryButtonText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
    rowButtons: { flexDirection: 'row', gap: 10, marginTop: 16 },
});

export default ProfileScreen;
