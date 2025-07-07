import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  Alert, ActivityIndicator, KeyboardAvoidingView,
  Platform, StyleSheet, ScrollView
} from 'react-native';

import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';


const AddScreen = ({ }) => {
  const [images, setImages] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [thongTin, setThongTin] = useState('');
  const [thuongHieu, setThuongHieu] = useState('');
  const [price, setPrice] = useState('');
  const [giaNhap, setGiaNhap] = useState('');
  const [giaGoc, setGiaGoc] = useState('');
  const [soLuong, setSoLuong] = useState('');
  const [bestseller, setBestseller] = useState(false);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('Điện thoại');
  const [items, setItems] = useState([
    { label: 'Điện thoại', value: 'Điện thoại' },
    { label: 'Máy tính bảng', value: 'Máy tính bảng' },
    { label: 'Laptop', value: 'Laptop' },
    { label: 'Phụ kiện', value: 'Phụ kiện' },
    { label: 'Smart Watch', value: 'Smart Watch' },
    { label: 'TV', value: 'TV' },
  ]);

  const [token, setToken] = useState(null);

useEffect(() => {
  const getToken = async () => {
    const storedToken = await AsyncStorage.getItem('userToken');
    if (storedToken) {
      setToken(storedToken);
    }
  };
  getToken();
}, []);


const handleSelectImage = async () => {
  // Yêu cầu quyền truy cập thư viện
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Lỗi', 'Bạn cần cấp quyền để truy cập thư viện ảnh');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true, // 👈 chỉ có hiệu lực trên web
    quality: 1,
  });

  if (!result.canceled) {
    const selected = result.assets.map((asset) => ({
      uri: asset.uri,
      type: 'image/jpeg',
      name: asset.fileName || `image_${Date.now()}.jpg`,
    }));
    setImages((prev) => [...prev, ...selected]);
  }
};



  const handleSubmit = async () => {
    if (!name || !price || !giaNhap || !giaGoc || !soLuong || !description || !thongTin || !thuongHieu) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất 1 ảnh');
      return;
    }

    if (Number(giaNhap) >= Number(price)) {
      Alert.alert('Lỗi', 'Giá nhập phải nhỏ hơn giá bán');
      return;
    }

    if (Number(giaGoc) <= Number(price)) {
      Alert.alert('Lỗi', 'Giá gốc phải lớn hơn giá bán');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('thongTin', thongTin);
    formData.append('thuongHieu', thuongHieu);
    formData.append('price', price);
    formData.append('giaNhap', giaNhap);
    formData.append('giaGoc', giaGoc);
    formData.append('soLuong', soLuong);
    formData.append('category', category);
    formData.append('bestseller', bestseller ? 'true' : 'false');

    images.forEach((image, index) => {
      formData.append('images', {
        uri: image.uri,
        type: image.type,
        name: image.name || `image_${index}.jpg`,
      });
    });

    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/api/product/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          token,
        },
      });

      if (res.data.success) {
        Alert.alert('Thành công', res.data.message);
        setName('');
        setDescription('');
        setThongTin('');
        setThuongHieu('');
        setPrice('');
        setGiaNhap('');
        setGiaGoc('');
        setSoLuong('');
        setImages([]);
      } else {
        Alert.alert('Thất bại', res.data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể gửi dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.label, { marginTop: 50 }]}>Tải ảnh lên</Text>

          <TouchableOpacity onPress={handleSelectImage} style={styles.imageUpload}>
            <Text>Chọn ảnh</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', marginBottom: 10, flexWrap: 'wrap' }}>
            {images.map((item, index) => (
              <View key={index} style={{ position: 'relative', marginRight: 8, marginBottom: 8 }}>
                <Image source={{ uri: item.uri }} style={{ width: 80, height: 80, borderRadius: 6 }} />
                <TouchableOpacity
                  onPress={() => {
                    const newImages = [...images];
                    newImages.splice(index, 1);
                    setImages(newImages);
                  }}
                  style={styles.removeButton}
                >
                  <Text style={{ color: '#fff', fontSize: 12 }}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Text style={styles.label}>Tên sản phẩm</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Tên" />

          <Text style={styles.label}>Mô tả</Text>
          <TextInput value={description} onChangeText={setDescription} style={styles.input} multiline />

          <Text style={styles.label}>Thông tin</Text>
          <TextInput value={thongTin} onChangeText={setThongTin} style={styles.input} multiline />

          <Text style={styles.label}>Thương hiệu</Text>
          <TextInput value={thuongHieu} onChangeText={setThuongHieu} style={styles.input} />

          <Text style={styles.label}>Giá bán</Text>
          <TextInput value={price} onChangeText={setPrice} style={styles.input} keyboardType="numeric" />

          <Text style={styles.label}>Giá nhập</Text>
          <TextInput value={giaNhap} onChangeText={setGiaNhap} style={styles.input} keyboardType="numeric" />

          <Text style={styles.label}>Giá gốc</Text>
          <TextInput value={giaGoc} onChangeText={setGiaGoc} style={styles.input} keyboardType="numeric" />

          <Text style={styles.label}>Số lượng</Text>
          <TextInput value={soLuong} onChangeText={setSoLuong} style={styles.input} keyboardType="numeric" />

          {/* 👇 Di chuyển DropDownPicker xuống đây, tránh lỗi VirtualizedLists */}
          <Text style={styles.label}>Danh mục</Text>
          <View style={{ zIndex: 1000, marginBottom: 16 }}>
            <DropDownPicker
              open={open}
              value={category}
              items={items}
              setOpen={setOpen}
              setValue={setCategory}
              setItems={setItems}
              placeholder="Chọn danh mục"
              zIndex={3000}
              zIndexInverse={1000}
            />
          </View>

          <TouchableOpacity onPress={() => setBestseller(!bestseller)} style={styles.checkbox}>
            <Text>{bestseller ? '✓' : '☐'} Thêm vào bán chạy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.button, loading && { opacity: 0.5 }]}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>Thêm</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddScreen;

const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#f43f5e',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
  },
  imageUpload: {
    backgroundColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  checkbox: {
    marginTop: 10,
    marginBottom: 10,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'red',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
