import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Button,
} from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import { MaterialIcons } from '@expo/vector-icons'
import { BACKEND_URL, currency } from '../config'

const ListScreen = () => {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [token, setToken] = useState(null)
  const [filterMode, setFilterMode] = useState('default'); // 'default' | 'lowStock'



  const navigation = useNavigation()

  // Lấy token khi component mount
  useEffect(() => {
    const getToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken')
        if (savedToken) setToken(savedToken)
      } catch (e) {
        console.log('Lỗi lấy token:', e)
      }
    }
    getToken()
  }, [])

  // Khi token có thì gọi API load danh sách
  useEffect(() => {
    if (token) {
      fetchList()
    }
  }, [token])

  const fetchList = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${BACKEND_URL}/api/product/list`, {
        headers: { token }, // Thường API có token header, nếu cần
      })
      if (response.data.success) {
        setList(response.data.products)
        const uniqueCategories = [...new Set(response.data.products.map(p => p.category))]
        setCategories(uniqueCategories)
      } else {
        Alert.alert('Lỗi', response.data.message || 'Không lấy được danh sách sản phẩm')
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(cat => cat !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const clearSelection = () => {
    setSelectedCategories([])
  }

  let filteredList = [...list];

  // Lọc theo danh mục nếu có
  if (selectedCategories.length > 0) {
    filteredList = filteredList.filter(item => selectedCategories.includes(item.category));
  }

  // Nếu chọn "sắp hết hàng", sắp xếp theo số lượng tăng dần
  if (filterMode === 'lowStock') {
    filteredList.sort((a, b) => a.soLuong - b.soLuong);
  }



  const removeProduct = async (id) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        onPress: async () => {
          try {
            const response = await axios.post(
              `${BACKEND_URL}/api/product/remove`,
              { id },
              { headers: { token } }
            )
            if (response.data.success) {
              Alert.alert('Thành công', response.data.message)
              fetchList()
            } else {
              Alert.alert('Lỗi', response.data.message)
            }
          } catch (error) {
            Alert.alert('Lỗi', error.message)
          }
        },
        style: 'destructive',
      },
    ])
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('UpdateProduct', { id: item._id })}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image[0] }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.text}>{item.category}</Text>
        <Text style={styles.text}>
          Giá nhập: {item.giaNhap.toLocaleString('vi-VN')} {currency}
        </Text>
        <Text style={styles.text}>
          Giá bán: {item.price.toLocaleString('vi-VN')} {currency}
        </Text>
        <Text style={styles.text}>Số lượng: {item.soLuong}</Text>
      </View>
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation?.()
          removeProduct(item._id)
        }}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteText}>X</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )

  if (loading || !token) {
    return (
      <View style={[styles.loadingContainer, { marginTop: 50 }]}>
        <ActivityIndicator size="large" color="#FEBE10" />
      </View>
    )
  }

  return (
    <View style={[styles.container, { marginTop: 50 }]}>
      <Text style={styles.title}>Tất cả sản phẩm</Text>

      <View style={{ marginBottom: 10 }}>
        <Button title="Làm mới danh sách" onPress={fetchList} color="#FEBE10" />
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 10, gap: 10 }}>
        <Button
          title="Mặc định"
          onPress={() => setFilterMode('default')}
          color={filterMode === 'default' ? '#FEBE10' : '#ccc'}
        />
        <Button
          title="Sắp hết hàng"
          onPress={() => setFilterMode('lowStock')}
          color={filterMode === 'lowStock' ? '#FEBE10' : '#ccc'}
        />
      </View>


      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={[styles.clearButton, selectedCategories.length === 0 && styles.clearButtonActive]}
          onPress={clearSelection}
        >
          <Text
            style={[styles.clearButtonText, selectedCategories.length === 0 && styles.clearButtonTextActive]}
          >
            Bỏ chọn tất cả
          </Text>
        </TouchableOpacity>

        {categories.map(cat => {
          const selected = selectedCategories.includes(cat)
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.checkbox, selected && styles.checkboxSelected]}
              onPress={() => toggleCategory(cat)}
            >
              <MaterialIcons
                name={selected ? "check-box" : "check-box-outline-blank"}
                size={24}
                color={selected ? "#FEBE10" : "#555"}
              />
              <Text style={styles.checkboxLabel}>{cat}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <FlatList
        data={filteredList}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có sản phẩm</Text>}
      />
    </View>
  )
}

export default ListScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827',
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    alignItems: 'center',
  },
  clearButton: {
    marginRight: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#ddd',
    borderRadius: 6,
  },
  clearButtonActive: {
    backgroundColor: '#FEBE10',
  },
  clearButtonText: {
    color: '#555',
    fontWeight: '600',
  },
  clearButtonTextActive: {
    color: 'white',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 10,
  },
  checkboxSelected: {
    backgroundColor: '#fff7cc',
    borderRadius: 6,
    paddingHorizontal: 4,
  },
  checkboxLabel: {
    marginLeft: 4,
    fontSize: 14,
    color: '#333',
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    alignItems: 'center',
    elevation: 1,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 10,
    resizeMode: 'cover',
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 2,
    color: '#111827',
  },
  text: {
    fontSize: 14,
    color: '#374151',
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  deleteText: {
    color: '#dc2626',
    fontWeight: 'bold',
    fontSize: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 30,
    fontStyle: 'italic',
  },
})
