import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';

const CLOUD_NAME = 'dzlfuiq7v'; // Cloud name của bạn
const UPLOAD_PRESET = 'my_preset'; // Upload preset unsigned

const Update = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({
    name: '',
    price: 0,
    giaNhap: 0,
    giaGoc: 0,
    category: '',
    thongTin: '',
    thuongHieu: '',
    bestseller: false,
    soLuong: 0,
    image: [],
  });

  const [newImages, setNewImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/product/single/${id}`, {
          headers: { token },
        });
        if (res.data.success) {
          const p = res.data.product;
          setProduct(p);
          setForm({
            name: p.name || '',
            price: p.price || 0,
            giaNhap: p.giaNhap || 0,
            giaGoc: p.giaGoc || 0,
            category: p.category || '',
            thongTin: p.thongTin || '',
            thuongHieu: p.thuongHieu || '',
            bestseller: p.bestseller || false,
            soLuong: p.soLuong || 0,
            image: p.image || [],
          });
        } else {
          toast.error(res.data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchProduct();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setNewImages([...e.target.files]);
  };

  const uploadImagesToCloudinary = async () => {
    const uploadedUrls = [];
    for (const file of newImages) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      try {
        setUploading(true);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
        const data = await res.json();
        console.log('🖼️ Cloudinary response:', data);
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
        } else {
          toast.error('Upload ảnh không thành công');
        }
      } catch (error) {
        toast.error('Upload ảnh thất bại: ' + error.message);
      }
    }
    setUploading(false);
    return uploadedUrls;
  };

  const handleUpdate = async () => {
    let imagesToSave = form.image;

    if (newImages.length > 0) {
      const uploadedUrls = await uploadImagesToCloudinary();
      imagesToSave = uploadedUrls; // ✅ Thay toàn bộ ảnh cũ
    }

    const dataToSend = {
      ...form,
      image: imagesToSave,
      price: Number(form.price),
      giaNhap: Number(form.giaNhap),
      giaGoc: Number(form.giaGoc),
      soLuong: Number(form.soLuong),
      bestseller: Boolean(form.bestseller),
    };

    console.log('📦 Dữ liệu gửi lên:', dataToSend);

    try {
      const res = await axios.put(
        `${backendUrl}/api/product/update/${id}`,
        dataToSend,
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success('Cập nhật sản phẩm thành công');
        navigate('/list', { replace: true }); // Điều hướng lại
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!product) return <p>Đang tải dữ liệu sản phẩm...</p>;

  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Cập nhật sản phẩm</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={thStyle}>Thuộc tính</th>
            <th style={thStyle}>Giá trị</th>
          </tr>
        </thead>
        <tbody>
          {/* Các input giống cũ */}
          <tr>
            <td style={tdStyle}>Tên sản phẩm</td>
            <td style={tdStyle}>
              <input type="text" name="name" value={form.name} onChange={handleChange} style={inputStyle} />
            </td>
          </tr>
          <tr>
            <td style={tdStyle}>Giá bán</td>
            <td style={tdStyle}>
              <input type="number" name="price" value={form.price} onChange={handleChange} style={inputStyle} />
            </td>
          </tr>
          <tr>
            <td style={tdStyle}>Giá nhập</td>
            <td style={tdStyle}>
              <input type="number" name="giaNhap" value={form.giaNhap} onChange={handleChange} style={inputStyle} />
            </td>
          </tr>
          <tr>
            <td style={tdStyle}>Giá gốc</td>
            <td style={tdStyle}>
              <input type="number" name="giaGoc" value={form.giaGoc} onChange={handleChange} style={inputStyle} />
            </td>
          </tr>
          <tr>
            <td style={tdStyle}>Loại sản phẩm</td>
            <td style={tdStyle}>
              <input type="text" name="category" value={form.category} onChange={handleChange} style={inputStyle} />
            </td>
          </tr>
          <tr>
            <td style={tdStyle}>Thông tin</td>
            <td style={tdStyle}>
              <textarea name="thongTin" value={form.thongTin} onChange={handleChange} style={{ ...inputStyle, height: 80 }} />
            </td>
          </tr>
          <tr>
            <td style={tdStyle}>Thương hiệu</td>
            <td style={tdStyle}>
              <input type="text" name="thuongHieu" value={form.thuongHieu} onChange={handleChange} style={inputStyle} />
            </td>
          </tr>
          <tr>
            <td style={tdStyle}>Bán chạy</td>
            <td style={{ ...tdStyle, textAlign: 'center' }}>
              <input type="checkbox" name="bestseller" checked={form.bestseller} onChange={handleChange} />
            </td>
          </tr>
          <tr>
            <td style={tdStyle}>Số lượng</td>
            <td style={tdStyle}>
              <input type="number" name="soLuong" value={form.soLuong} onChange={handleChange} style={inputStyle} />
            </td>
          </tr>
          <tr>
            <td style={tdStyle}>Ảnh hiện tại</td>
            <td style={tdStyle}>
              {form.image.length > 0 ? (
                form.image.map((url, i) => (
                  <img key={i} src={url} alt={`Ảnh ${i + 1}`} style={{ width: 60, height: 60, objectFit: 'cover', marginRight: 5 }} />
                ))
              ) : (
                <span>Chưa có ảnh</span>
              )}
            </td>
          </tr>
          <tr>
            <td style={tdStyle}>Chọn ảnh mới</td>
            <td style={tdStyle}>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} />
              {uploading && <p>⏳ Đang tải ảnh lên...</p>}
            </td>
          </tr>
        </tbody>
      </table>

      <button
        onClick={handleUpdate}
        style={{
          marginTop: 20,
          padding: '10px 30px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: 5,
          cursor: 'pointer',
          fontSize: 16,
          display: 'block',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
        disabled={uploading}
      >
        Lưu thay đổi
      </button>
    </div>
  );
};

const thStyle = {
  border: '1px solid #ddd',
  padding: 8,
  textAlign: 'left',
  backgroundColor: '#f9f9f9',
};

const tdStyle = {
  border: '1px solid #ddd',
  padding: 8,
  verticalAlign: 'middle',
};

const inputStyle = {
  width: '100%',
  padding: '6px 8px',
  fontSize: 14,
  boxSizing: 'border-box',
};

export default Update;
