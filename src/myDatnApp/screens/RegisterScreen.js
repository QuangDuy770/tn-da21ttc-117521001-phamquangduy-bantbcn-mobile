import { StyleSheet, Text, View, SafeAreaView, Pressable, KeyboardAvoidingView, TextInput, Alert } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { MaterialIcons } from '@expo/vector-icons'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BACKEND_URL } from '../config'

const RegisterScreen = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)  // trạng thái hiện/ẩn mật khẩu
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const navigation = useNavigation()

  const sendOtp = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email')
      return
    }
    setOtpLoading(true)
    try {
      const response = await axios.post(`${BACKEND_URL}/api/user/send-otp`, { email })
      if (response.data.success) {
        Alert.alert('Thành công', 'Mã OTP đã được gửi vào email của bạn')
        setOtpSent(true)
      } else {
        Alert.alert('Lỗi', response.data.message || 'Gửi OTP thất bại')
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi gửi OTP. Vui lòng thử lại.')
    } finally {
      setOtpLoading(false)
    }
  }

  const register = async () => {
    if (!otpSent) {
      Alert.alert('Vui lòng gửi và nhập mã OTP trước khi đăng ký')
      return
    }
    if (!otp) {
      Alert.alert('Vui lòng nhập mã OTP')
      return
    }

    setLoading(true)
    setErrorMessage(null)
    try {
      const response = await axios.post(`${BACKEND_URL}/api/user/register`, {
        name,
        email,
        password,
        otp,
      })
      if (response.data.success) {
        await AsyncStorage.setItem('userToken', response.data.token)
        Alert.alert(
          'Đăng ký thành công',
          'Bạn đã đăng ký tài khoản thành công! Vui lòng đăng nhập.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        )
      } else {
        setErrorMessage(response.data.message)
      }
    } catch (error) {
      setErrorMessage('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior="padding">
        <View style={styles.textContainer}>
          <Text style={styles.headingText}>ĐĂNG KÍ</Text>
        </View>

        {/* Name input */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="person" size={24} color="black" />
          <TextInput
            style={styles.input}
            placeholder="Nhập tên đăng kí"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Email input + Gửi OTP */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={24} color="black" />
          <TextInput
            style={styles.input}
            placeholder="Nhập email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <Pressable
            onPress={sendOtp}
            disabled={otpLoading || !email}
            style={{
              marginLeft: 10,
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: otpLoading || !email ? '#ccc' : '#007FFF',
              borderRadius: 5,
            }}
          >
            <Text style={{ color: 'white' }}>{otpLoading ? 'Đang gửi...' : 'Gửi OTP'}</Text>
          </Pressable>
        </View>

        {/* Password input có hiện/ẩn mật khẩu */}
        <View style={styles.inputContainer}>
          <FontAwesome name="lock" size={24} color="black" />
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <MaterialIcons
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color="gray"
            />
          </Pressable>
        </View>

        {/* OTP input, hiện khi đã gửi */}
        {otpSent && (
          <View style={[styles.inputContainer, { marginTop: 20 }]}>
            <MaterialIcons name="vpn-key" size={24} color="black" />
            <TextInput
              style={styles.input}
              placeholder="Nhập mã OTP"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
            />
          </View>
        )}

        {/* Lỗi */}
        {errorMessage && (
          <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>{errorMessage}</Text>
        )}

        <View
          style={{
            marginTop: 20,
            marginBottom: 10,
          }}
        >
          <Pressable
            style={{
              width: 200,
              backgroundColor: '#FEBE10',
              borderRadius: 6,
              alignSelf: 'center',
              padding: 15,
            }}
            onPress={register}
            disabled={loading}
          >
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 16,
                fontWeight: 'bold',
              }}
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Text>
          </Pressable>
        </View>

        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ textAlign: 'center', color: 'gray', fontSize: 16 }}>
            Đã có tài khoản? Đăng nhập ngay
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default RegisterScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
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
    marginTop: 10,
    marginBottom: 10,
    width: '80%',
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
  },
})
