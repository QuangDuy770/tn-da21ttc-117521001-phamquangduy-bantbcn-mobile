import React, { useEffect, useState } from 'react';

const User = () => {
  // Danh sách user
  const [users, setUsers] = useState([]);
  // Danh sách products (để tra cứu tên)
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Gọi API lấy tất cả user
    fetch(`${backendUrl}/api/user/get`)
      .then((res) => res.json())
      .then((data) => {
        console.log('User list response:', data);
        if (data.success) {
          setUsers(data.data);
        } else {
          setError(data.message || 'Không lấy được danh sách user');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Lỗi kết nối đến server');
      });

    // Gọi API lấy danh sách sản phẩm
    fetch(`${backendUrl}/api/product/list`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Product list response:', data);
        // CHÚ Ý: data.products chứ không phải data.data
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          console.log(
            'Không lấy được danh sách sản phẩm hoặc data.products không phải mảng'
          );
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  // Tạo một object để tra cứu (lookup) productId -> productName
  const productMap = (Array.isArray(products) ? products : []).reduce(
    (acc, product) => {
      acc[product._id] = product.name;
      return acc;
    },
    {}
  );

  // Hàm kiểm tra đối tượng rỗng
  const isEmptyObject = (obj) => {
    if (!obj) return true;
    return Object.keys(obj).length === 0;
  };

  // Hàm render List cho WishData và CartData
  const renderProductList = (dataObj) => {
    if (isEmptyObject(dataObj)) {
      return <p className="mt-1 text-gray-500 italic">Không có</p>;
    }

    const filteredKeys = Object.keys(dataObj).filter(
      (productId) => dataObj[productId] !== null && dataObj[productId] !== undefined
    );

    if (filteredKeys.length === 0) {
      return <p className="mt-1 text-gray-500 italic">Không có</p>;
    }

    return (
      <ul className="ml-4 list-disc space-y-1 mt-1">
        {filteredKeys.map((productId) => {
          const productName = productMap[productId] || productId;
          const quantity = dataObj[productId];
          return (
            <li key={productId} className="text-gray-700">
              {productName}
              <span className="ml-2">
                - <strong>Số lượng:</strong> {quantity}
              </span>
            </li>
          );
        })}
      </ul>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Danh sách Người dùng
      </h1>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded mb-4">
          Lỗi: {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white rounded-xl shadow p-4 flex flex-col justify-between"
          >
            {/* Thông tin người dùng */}
            <div>
              <p className="text-gray-700">
                <strong>Tên:</strong> {user.name}
              </p>
              <p className="text-gray-700 mt-1">
                <strong>Email:</strong> {user.email}
              </p>
            </div>

            {/* Wish Data */}
            <div className="mt-4">
              <p className="text-md font-bold text-gray-700">Wish Data</p>
              {renderProductList(user.wishData)}
            </div>

            {/* Cart Data */}
            <div className="mt-4">
              <p className="text-md font-bold text-gray-700">Cart Data</p>
              {renderProductList(user.cartData)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default User;
