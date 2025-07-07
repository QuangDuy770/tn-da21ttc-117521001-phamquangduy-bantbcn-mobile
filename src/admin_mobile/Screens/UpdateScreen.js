import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
} from 'react-native'
import axios from 'axios'
import { useNavigation, useRoute } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import { BACKEND_URL, currency } from '../config'
import AsyncStorage from '@react-native-async-storage/async-storage'

const CLOUD_NAME = 'dzlfuiq7v' // Thay bằng Cloudinary cloud name của bạn
const UPLOAD_PRESET = 'my_preset' // Thay bằng upload preset của bạn

const UpdateScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { id } = route.params

  const [form, setForm] = useState({
    name: '',
    price: '',
    giaNhap: '',
    giaGoc: '',
    category: '',
    thongTin: '',
    thuongHieu: '',
    bestseller: false,
    soLuong: '',
    image: [],
  })

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // selectedImages lưu ảnh hiện tại (cũ + mới)
  // mỗi ảnh mới thêm isNew: true để phân biệt ảnh chưa upload
  const [selectedImages, setSelectedImages] = useState([])

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${BACKEND_URL}/api/product/single/${id}`)
        if (res.data.success) {
          const p = res.data.product
          setForm({
            name: p.name || '',
            price: p.price ? p.price.toString() : '',
            giaNhap: p.giaNhap ? p.giaNhap.toString() : '',
            giaGoc: p.giaGoc ? p.giaGoc.toString() : '',
            category: p.category || '',
            thongTin: p.thongTin || '',
            thuongHieu: p.thuongHieu || '',
            bestseller: p.bestseller || false,
            soLuong: p.soLuong ? p.soLuong.toString() : '',
            image: p.image || [],
          })
          // Đưa ảnh cũ vào selectedImages với isNew = false
          setSelectedImages(
            p.image ? p.image.map((url) => ({ uri: url, isNew: false })) : []
          )
        } else {
          Alert.alert('Lỗi', res.data.message || 'Không lấy được sản phẩm')
        }
      } catch (error) {
        Alert.alert('Lỗi', error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const pickImages = async () => {
    // Yêu cầu quyền truy cập thư viện ảnh
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Bạn cần cấp quyền để truy cập thư viện ảnh')
      return
    }

    // Chọn ảnh (chỉ 1 ảnh/lần trên mobile)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    })

    if (!result.canceled) {
      const newSelected = result.assets.map((asset) => ({
        uri: asset.uri,
        type: 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}.jpg`,
        isNew: true, // đánh dấu là ảnh mới
      }))
      // Cộng dồn ảnh mới vào selectedImages
      setSelectedImages((prev) => [...prev, ...newSelected])
    }
  }

  const uploadImagesToCloudinary = async () => {
    setUploading(true)
    const uploadedUrls = []

    // Lọc ảnh mới cần upload
    const imagesToUpload = selectedImages.filter((img) => img.isNew)

    for (const img of imagesToUpload) {
      const formData = new FormData()
      formData.append('file', {
        uri: img.uri,
        type: img.type,
        name: img.name,
      })
      formData.append('upload_preset', UPLOAD_PRESET)

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        )
        const data = await res.json()
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url)
        } else {
          Alert.alert('Lỗi upload ảnh', 'Không nhận được URL từ Cloudinary')
        }
      } catch (error) {
        Alert.alert('Lỗi upload ảnh', error.message)
      }
    }

    setUploading(false)

    // Ảnh cũ không upload lấy uri, ghép với ảnh mới đã upload
    const oldUrls = selectedImages
      .filter((img) => !img.isNew)
      .map((img) => img.uri)

    return [...oldUrls, ...uploadedUrls]
  }

  const handleUpdate = async () => {
    setLoading(true)
    try {
      let imagesToSave = form.image

      if (selectedImages.length > 0) {
        imagesToSave = await uploadImagesToCloudinary()
      }

      const dataToSend = {
        ...form,
        price: Number(form.price),
        giaNhap: Number(form.giaNhap),
        giaGoc: Number(form.giaGoc),
        soLuong: Number(form.soLuong),
        bestseller: Boolean(form.bestseller),
        image: imagesToSave,
      }

      const token = await AsyncStorage.getItem('userToken')

      const res = await axios.put(`${BACKEND_URL}/api/product/update/${id}`, dataToSend, {
        headers: { token },
      })

      if (res.data.success) {
        Alert.alert('Thành công', 'Cập nhật sản phẩm thành công')
        navigation.goBack()
      } else {
        Alert.alert('Lỗi', res.data.message)
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FEBE10" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={[styles.label, { marginTop: 60 }]}>Tên sản phẩm</Text>

      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={(text) => handleChange('name', text)}
        placeholder="Nhập tên sản phẩm"
      />

      <Text style={styles.label}>Giá bán ({currency})</Text>
      <TextInput
        style={styles.input}
        value={form.price}
        onChangeText={(text) => handleChange('price', text)}
        placeholder="Nhập giá bán"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Giá nhập ({currency})</Text>
      <TextInput
        style={styles.input}
        value={form.giaNhap}
        onChangeText={(text) => handleChange('giaNhap', text)}
        placeholder="Nhập giá nhập"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Giá gốc ({currency})</Text>
      <TextInput
        style={styles.input}
        value={form.giaGoc}
        onChangeText={(text) => handleChange('giaGoc', text)}
        placeholder="Nhập giá gốc"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Loại sản phẩm</Text>
      <TextInput
        style={styles.input}
        value={form.category}
        onChangeText={(text) => handleChange('category', text)}
        placeholder="Nhập loại sản phẩm"
      />

      <Text style={styles.label}>Thông tin</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={form.thongTin}
        onChangeText={(text) => handleChange('thongTin', text)}
        placeholder="Nhập thông tin sản phẩm"
        multiline
      />

      <Text style={styles.label}>Thương hiệu</Text>
      <TextInput
        style={styles.input}
        value={form.thuongHieu}
        onChangeText={(text) => handleChange('thuongHieu', text)}
        placeholder="Nhập thương hiệu"
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Bán chạy</Text>
        <Switch
          value={form.bestseller}
          onValueChange={(val) => handleChange('bestseller', val)}
        />
      </View>

      <Text style={styles.label}>Số lượng</Text>
      <TextInput
        style={styles.input}
        value={form.soLuong}
        onChangeText={(text) => handleChange('soLuong', text)}
        placeholder="Nhập số lượng"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Ảnh hiện tại và ảnh mới chọn</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
        {selectedImages.length > 0 ? (
          selectedImages.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img.uri }}
              style={styles.image}
            />
          ))
        ) : (
          <Text>Chưa có ảnh</Text>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.uploadButton} onPress={pickImages}>
        <Text style={styles.uploadButtonText}>Chọn ảnh mới</Text>
      </TouchableOpacity>

      {uploading && <Text style={{ textAlign: 'center', marginVertical: 10 }}>Đang tải ảnh lên...</Text>}

      <TouchableOpacity
        style={[styles.saveButton, loading && { backgroundColor: '#ccc' }]}
        onPress={handleUpdate}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    fontSize: 16,
    color: '#111',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageScroll: {
    marginBottom: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 10,
  },
  uploadButton: {
    backgroundColor: '#007FFF',
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#FEBE10',
    paddingVertical: 14,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#111',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default UpdateScreen
