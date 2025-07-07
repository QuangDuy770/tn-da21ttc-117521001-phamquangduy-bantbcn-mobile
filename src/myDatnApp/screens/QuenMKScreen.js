import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native'
import axios from 'axios'
import { BACKEND_URL } from '../config'

const QuenMKScreen = () => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const sendOtp = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post(`${BACKEND_URL}/api/user/send-otp`, { email })
      if (res.data.success) {
        Alert.alert('Thành công', 'Mã OTP đã được gửi vào email của bạn')
        setOtpSent(true)
      } else {
        Alert.alert('Lỗi', res.data.message || 'Gửi OTP thất bại')
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi gửi OTP. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async () => {
    if (!otp || !newPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã OTP và mật khẩu mới')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post(`${BACKEND_URL}/api/user/reset-password`, {
        email,
        otp,
        newPassword,
      })
      if (res.data.success) {
        Alert.alert('Thành công', 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.')
        // Reset lại state để quay lại bước nhập email
        setEmail('')
        setOtp('')
        setNewPassword('')
        setOtpSent(false)
      } else {
        Alert.alert('Lỗi', res.data.message || 'Đổi mật khẩu thất bại')
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi đổi mật khẩu. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <Text style={styles.title}>Quên Mật Khẩu</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập email đã đăng ký"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            editable={!otpSent}
          />
        </View>

        {!otpSent ? (
          <Pressable
            style={[styles.button, loading && { backgroundColor: '#ccc' }]}
            onPress={sendOtp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Đang gửi...' : 'Gửi mã OTP'}</Text>
          </Pressable>
        ) : (
          <>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nhập mã OTP"
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
                maxLength={6}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu mới"
                secureTextEntry={true}
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <Pressable
              style={[styles.button, loading && { backgroundColor: '#ccc' }]}
              onPress={resetPassword}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default QuenMKScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#041E42',
  },
  inputContainer: {
    backgroundColor: '#D0D0D0',
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  input: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FEBE10',
    borderRadius: 6,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
})
