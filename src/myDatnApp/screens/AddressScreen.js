import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Alert,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { BACKEND_URL } from '../config';

// import dữ liệu tỉnh và huyện
import { provinces, districts } from './locations';

const AddressScreen = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',    // huyện/quận
    state: '',   // tỉnh/thành phố
    phone: '',
  });

  const [districtList, setDistrictList] = useState([]);

  // trạng thái bật/tắt nhập tay cho tỉnh và huyện
  const [manualState, setManualState] = useState(false);
  const [manualCity, setManualCity] = useState(false);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  // Khi chọn tỉnh thì cập nhật danh sách huyện tương ứng
  useEffect(() => {
    if (form.state && !manualState) {
      setDistrictList(districts[form.state] || []);
      setForm(prev => ({ ...prev, city: '' }));
    } else {
      setDistrictList([]);
      setForm(prev => ({ ...prev, city: '' }));
    }
  }, [form.state, manualState]);

  const handleSubmit = async () => {
    const { firstName, lastName, email, street, city, state, phone } = form;

    // Validate
    if (!firstName || !lastName || !email || !street || !city || !state || !phone) {
      Alert.alert('⚠️ Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('❌ Email không hợp lệ');
      return;
    }

    const phoneRegex = /^[0-9]{9,12}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('❌ Số điện thoại không hợp lệ (9-12 số)');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Bạn chưa đăng nhập');
        return;
      }

      const res = await axios.post(`${BACKEND_URL}/api/address/set`, {
        userId,
        address: form,
      });

      if (res.data.success) {
        Alert.alert('✅ Đã lưu địa chỉ thành công!');
        setForm({
          firstName: '',
          lastName: '',
          email: '',
          street: '',
          city: '',
          state: '',
          phone: '',
        });
        setManualState(false);
        setManualCity(false);
      } else {
        Alert.alert('❌ Lỗi:', res.data.message || 'Không thể lưu địa chỉ');
      }
    } catch (error) {
      console.log('Lỗi lưu địa chỉ:', error);
      Alert.alert('Lỗi hệ thống', error.message || 'Không thể kết nối');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.header}>📍 Địa chỉ nhận hàng</Text>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Họ"
            value={form.lastName}
            onChangeText={(text) => handleChange('lastName', text)}
            autoCapitalize="words"
            autoCorrect={true}  // Bật autoCorrect để hỗ trợ tiếng Việt
            textContentType="familyName"
            keyboardType="default"
            maxLength={1000}  // Thêm maxLength để tránh lỗi gõ dấu
            importantForAutofill="no"  // Đảm bảo autofill không gây lỗi
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Tên"
            value={form.firstName}
            onChangeText={(text) => handleChange('firstName', text)}
            autoCapitalize="words"
            autoCorrect={true}  // Bật autoCorrect để hỗ trợ tiếng Việt
            textContentType="givenName"
            keyboardType="default"
            maxLength={1000}
            importantForAutofill="no"
          />
        </View>

        <View style={styles.rowFull}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={form.email}
            onChangeText={(text) => handleChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.rowFull}>
          <TextInput
            style={styles.input}
            placeholder="Đường"
            value={form.street}
            onChangeText={(text) => handleChange('street', text)}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 5 }}>
            <Text style={styles.label}>Tỉnh/Thành phố</Text>
            {!manualState ? (
              <>
                <Picker
                  selectedValue={form.state}
                  onValueChange={(val) => handleChange('state', val)}
                  style={styles.picker}
                >
                  <Picker.Item label="Chọn tỉnh/thành phố" value="" />
                  {provinces.map((p, i) => (
                    <Picker.Item key={i} label={p} value={p} />
                  ))}
                </Picker>
                <TouchableOpacity onPress={() => setManualState(true)} style={styles.toggleBtn}>
                  <Text style={{ color: '#0066b2', fontSize: 12 }}>Nhập thủ công</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập tỉnh/thành phố"
                  value={form.state}
                  onChangeText={(text) => handleChange('state', text)}
                  autoCapitalize="words"
                />
                <TouchableOpacity onPress={() => setManualState(false)} style={styles.toggleBtn}>
                  <Text style={{ color: '#0066b2', fontSize: 12 }}>Chọn từ danh sách</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={{ flex: 1, marginLeft: 5 }}>
            <Text style={styles.label}>Huyện/Quận</Text>
            {!manualCity ? (
              <>
                <Picker
                  enabled={districtList.length > 0 && !manualCity}
                  selectedValue={form.city}
                  onValueChange={(val) => handleChange('city', val)}
                  style={styles.picker}
                >
                  <Picker.Item label="Chọn huyện/quận" value="" />
                  {districtList.map((d, i) => (
                    <Picker.Item key={i} label={d} value={d} />
                  ))}
                </Picker>
                <TouchableOpacity onPress={() => setManualCity(true)} style={styles.toggleBtn}>
                  <Text style={{ color: '#0066b2', fontSize: 12 }}>Nhập thủ công</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập huyện/quận"
                  value={form.city}
                  onChangeText={(text) => handleChange('city', text)}
                  autoCapitalize="words"
                />
                <TouchableOpacity onPress={() => setManualCity(false)} style={styles.toggleBtn}>
                  <Text style={{ color: '#0066b2', fontSize: 12 }}>Chọn từ danh sách</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.rowFull}>
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            value={form.phone}
            onChangeText={(text) => handleChange('phone', text)}
            keyboardType="phone-pad"
          />
        </View>

        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Lưu địa chỉ</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddressScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    color: '#2c3e50',
  },
  container: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rowFull: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  picker: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  toggleBtn: {
    marginTop: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#fff',
    borderColor: '#27ae60',
    borderWidth: 2,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#27ae60',
    fontWeight: 'bold',
    fontSize: 16,
  },
  label: {
    marginBottom: 5,
    fontWeight: '600',
  },
});
