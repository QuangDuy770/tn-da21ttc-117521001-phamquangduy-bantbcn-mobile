import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, FlatList, ScrollView } from 'react-native'
import axios from 'axios'
import { BACKEND_URL } from '../config'

const Users = () => {
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    // Lấy danh sách user
    axios.get(`${BACKEND_URL}/api/user/get`)
      .then(res => {
        if (res.data.success) {
          setUsers(res.data.data)
        } else {
          setError(res.data.message || 'Không lấy được danh sách user')
        }
      })
      .catch(() => setError('Lỗi kết nối đến server'))

    // Lấy danh sách sản phẩm
    axios.get(`${BACKEND_URL}/api/product/list`)
      .then(res => {
        if (res.data.success && Array.isArray(res.data.products)) {
          setProducts(res.data.products)
        } else {
          console.log('Không lấy được danh sách sản phẩm hoặc data.products không phải mảng')
        }
      })
      .catch(console.error)
  }, [])

  // Tạo map tra cứu productId → productName
  const productMap = (Array.isArray(products) ? products : []).reduce((acc, product) => {
    acc[product._id] = product.name
    return acc
  }, {})

  // Kiểm tra object rỗng
  const isEmptyObject = (obj) => {
    if (!obj) return true
    return Object.keys(obj).length === 0
  }

  // Render danh sách sản phẩm trong WishData hoặc CartData
  const renderProductList = (dataObj) => {
    if (isEmptyObject(dataObj)) {
      return <Text style={styles.emptyText}>Không có</Text>
    }

    const filteredKeys = Object.keys(dataObj).filter(key => dataObj[key] !== null && dataObj[key] !== undefined)

    if (filteredKeys.length === 0) {
      return <Text style={styles.emptyText}>Không có</Text>
    }

    return filteredKeys.map(productId => {
      const productName = productMap[productId] || productId
      const quantity = dataObj[productId]
      return (
        <View key={productId} style={styles.productItem}>
          <Text style={styles.productName}>{productName}</Text>
          <Text style={styles.productQuantity}>Số lượng: {quantity}</Text>
        </View>
      )
    })
  }

  // Render từng user item
  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View>
        <Text style={styles.userText}><Text style={styles.bold}>Tên:</Text> {item.name}</Text>
        <Text style={styles.userText}><Text style={styles.bold}>Email:</Text> {item.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wish Data</Text>
        {renderProductList(item.wishData)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cart Data</Text>
        {renderProductList(item.cartData)}
      </View>
    </View>
  )

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Danh sách Người dùng</Text>

      {error ? (
        <Text style={styles.errorText}>Lỗi: {error}</Text>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>Không có người dùng</Text>}
        />
      )}
    </ScrollView>
  )
}

export default Users

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9fafb',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop:'60',
    marginBottom: 16,
    color: '#1f2937',
  },
  errorText: {
    color: '#b91c1c',
    marginBottom: 16,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#6b7280',
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 50,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  userText: {
    color: '#374151',
    marginBottom: 4,
  },
  bold: {
    fontWeight: '600',
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#111827',
    marginBottom: 6,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  productName: {
    color: '#4b5563',
  },
  productQuantity: {
    color: '#6b7280',
  },
})
