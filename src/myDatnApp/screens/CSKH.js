import { StyleSheet, Text, View, ScrollView, Linking, TouchableOpacity } from 'react-native';
import React from 'react';

const CSKH = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📞 Liên hệ CSKH</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Số điện thoại</Text>
        <TouchableOpacity onPress={() => Linking.openURL('tel:18001234')}>
          <Text style={styles.value}>1800 1234</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TouchableOpacity onPress={() => Linking.openURL('mailto:support@example.com')}>
          <Text style={styles.value}>support@example.com</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Địa chỉ</Text>
        <Text style={styles.value}>
          123 Đường Trần Hưng Đạo, Phường 1, Quận 1, TP. Hồ Chí Minh
        </Text>
      </View>
    </ScrollView>
  );
};

export default CSKH;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fafafa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 30,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#2980b9',
  },
});
