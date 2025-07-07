import { StyleSheet, Text, View, SafeAreaView, Image, KeyboardAvoidingView, TextInput, Pressable, Alert } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';  // Import AsyncStorage
import { BACKEND_URL } from '../config'

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false);


    const handleLogin = async () => {
        setLoading(true);

        try {
            const response = await axios.post(`${BACKEND_URL}/api/user/login`, {
                email,
                password,
            });

            if (response.data.success) {
                const token = response.data.token;
                const userId = response.data.user._id; // ✅ lấy userId từ response

                // Lưu token và userId vào AsyncStorage
                await AsyncStorage.setItem('userToken', token);
                await AsyncStorage.setItem('userId', userId);

                Alert.alert("Đăng nhập thành công", "Chào mừng bạn đến với hệ thống!", [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate('Main'),
                    },
                ]);
            } else {
                Alert.alert("Lỗi", response.data.message);
            }
        } catch (error) {
            console.error("Login error:", error);
            Alert.alert("Đã xảy ra lỗi", "Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };



    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.imageContainer}>
                <Image style={styles.logo} source={require('../assets/logo.png')} />
            </View>

            <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior="padding">
                <View style={styles.textContainer}>
                    <Text style={styles.headingText}>ĐĂNG NHẬP</Text>
                </View>

                {/* Email input */}
                <View style={styles.inputContainer}>
                    <MaterialIcons name="email" size={24} color="black" />
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập Email"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                {/* Password input */}
                <View style={[styles.inputContainer, { marginTop: 5 }]}>
                    <FontAwesome name="lock" size={24} color="black" />
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập Mật Khẩu"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)} style={{ paddingHorizontal: 10 }}>
                        <MaterialIcons
                            name={showPassword ? "visibility" : "visibility-off"}
                            size={24}
                            color="gray"
                        />
                    </Pressable>
                </View>


                <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text>Lưu đăng nhập</Text>

                    {/* Đây là nút bấm chuyển sang màn hình QuenMK */}
                    <Pressable onPress={() => navigation.navigate('QuenMK')}>
                        <Text style={{ color: '#007FFF', fontWeight: '500' }}>Quên mật khẩu</Text>
                    </Pressable>
                </View>
                <View style={{ marginTop: 70, marginBottom: 10 }}>
                    <Pressable
                        style={{ width: 200, backgroundColor: '#FEBE10', borderRadius: 6, alignSelf: 'center', padding: 15 }}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={{ textAlign: 'center', color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </Text>
                    </Pressable>
                </View>

                <Pressable onPress={() => navigation.navigate('Register')}>
                    <Text style={{ textAlign: 'center', color: 'gray', fontSize: 16 }}>Chưa có tài khoản? Đăng kí ngay</Text>
                </Pressable>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
    },
    imageContainer: {
        marginTop: 20,
    },
    logo: {
        width: 150,
        height: 100,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    textContainer: {
        alignItems: 'center',
        marginTop: 30,
    },
    headingText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#041E42',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D0D0D0',
        paddingVertical: 5,
        borderRadius: 5,
        marginTop: 20,
        marginBottom: 10,
        width: '80%',
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        paddingHorizontal: 10,
        fontSize: 16,
    },
});
