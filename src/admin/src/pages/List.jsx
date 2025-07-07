import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [sortOrder, setSortOrder] = useState('default'); // Thêm state cho sắp xếp
  const navigate = useNavigate();

  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const removeProduct = async (id, e) => {
    e.stopPropagation(); // tránh kích hoạt click chọn sản phẩm khi bấm X
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // Hàm để xử lý sắp xếp sản phẩm theo số lượng
  const sortList = (order) => {
    let sortedList = [...list];
    if (order === 'restock') {
      // Sắp xếp theo sản phẩm sắp hết hàng (số lượng ít nhất)
      sortedList = sortedList.sort((a, b) => a.soLuong - b.soLuong);
    } else {
      // Sắp xếp theo mặc định (không thay đổi thứ tự)
      // Không thay đổi thứ tự ban đầu
      sortedList = [...list];
    }
    setList(sortedList);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
    sortList(event.target.value); // Lọc lại danh sách khi thay đổi
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className="mb-2">Tất cả sản phẩm</p>
      
      {/* Dropdown lọc theo số lượng sắp hết hàng hoặc mặc định */}
      <div className="mb-2">
        <label htmlFor="sortOrder" className="mr-2">Sắp xếp: </label>
        <select
          id="sortOrder"
          value={sortOrder}
          onChange={handleSortChange}
          className="px-2 py-1 border"
        >
          <option value="default">Mặc định</option>
          <option value="restock">Sắp hết hàng</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Hình ảnh</b>
          <b>Tên</b>
          <b>Loại</b>
          <b>Giá nhập</b>
          <b>Giá bán</b>
          <b>Số lượng</b>
          <b className="text-center">Hành động</b>
        </div>

        {/* Product List */}
        {list.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(`/update/${item._id}`)}
            className="grid grid-cols-[1fr_2fr_1fr_1fr] md:grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm cursor-pointer"
          >
            <img className="w-12" src={item.image[0]} alt={item.name} />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>{item.giaNhap.toLocaleString('vi-VN')} {currency}</p>
            <p>{item.price.toLocaleString('vi-VN')} {currency}</p>
            <p>{item.soLuong}</p>
            <p
              onClick={(e) => removeProduct(item._id, e)}
              className="text-right md:text-center cursor-pointer text-lg text-red-600"
            >
              X
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default List;
