import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import { assets } from "../assets/assets";

const Add = ({ token }) => {
  const [images, setImages] = useState([]);  // Lưu mảng ảnh thay vì chỉ một ảnh
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thongTin, setThongTin] = useState("");
  const [thuongHieu, setThuongHieu] = useState("");
  const [price, setPrice] = useState("");
  const [giaNhap, setGiaNhap] = useState("");
  const [giaGoc, setGiaGoc] = useState("");
  const [category, setCategory] = useState("Điện thoại");
  const [bestseller, setBestseller] = useState(false);
  const [soLuong, setSoLuong] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Kiểm tra điều kiện giá nhập và giá gốc
    if (Number(giaNhap) >= Number(price)) {
      toast.error("Giá nhập phải nhỏ hơn giá sản phẩm!");
      return;
    }

    if (Number(giaGoc) <= Number(price)) {
      toast.error("Giá gốc phải lớn hơn giá bán!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("thongTin", thongTin);
      formData.append("thuongHieu", thuongHieu);
      formData.append("price", price);
      formData.append("giaNhap", giaNhap);
      formData.append("giaGoc", giaGoc);
      formData.append("category", category);
      formData.append("bestseller", bestseller ? "true" : "false"); // Chuyển đổi bestseller thành chuỗi "true"/"false"
      formData.append("soLuong", soLuong);

      // Duyệt qua các ảnh và thêm vào formData
      images.forEach((image) => {
        formData.append("images", image);  // Gửi tất cả ảnh
      });

      const response = await axios.post(`${backendUrl}/api/product/add`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        // Reset form
        setName("");
        setDescription("");
        setThongTin("");
        setThuongHieu("");
        setPrice("");
        setGiaNhap("");
        setGiaGoc("");
        setSoLuong("");
        setImages([]);  // Reset ảnh đã chọn
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImages((prevImages) => [...prevImages, file]); // ✅ Thêm ảnh theo đúng thứ tự chọn
    }
  };
  
  

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
      <div>
        <p className="mb-2">Tải ảnh lên</p>
        <div>
          <label htmlFor="images">
            <img
              className="w-20 cursor-pointer"
              src={images.length > 0 ? URL.createObjectURL(images[0]) : assets.upload_icon}
              alt="Tải ảnh"
            />
            <input
              type="file"
              id="images"
              hidden
              onChange={handleImageChange}
              accept="image/*"
             
            />
          </label>
        </div>
        {images.length > 0 && (
          <div>
            <p className="mt-2">Danh sách ảnh đã chọn:</p>
            <div className="flex gap-2">
              {Array.from(images).map((image, index) => (
                <div key={index} className="relative">
                  <img
                    className="w-20 h-20 object-cover"
                    src={URL.createObjectURL(image)}
                    alt={image.name}
                  />
                  <span
                    onClick={() => {
                      const updatedImages = images.filter((img) => img !== image);
                      setImages(updatedImages);
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 cursor-pointer"
                  >
                    X
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full">
        <p className="mb-2">Tên sản phẩm</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Nhập tên sản phẩm"
          required
        />
      </div>

      <div className="w-full">
        <p className="mb-2">Mô tả sản phẩm</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full max-w-[500px] px-3 py-2"
          placeholder="Nhập mô tả"
          required
        ></textarea>
      </div>

      <div className="w-full">
        <p className="mb-2">Thông tin</p>
        <textarea
          value={thongTin}
          onChange={(e) => setThongTin(e.target.value)}
          className="w-full max-w-[500px] px-3 py-2"
          placeholder="Nhập thông tin"
          required
        ></textarea>
      </div>

      <div className="w-full">
        <p className="mb-2">Thương hiệu</p>
        <input
          value={thuongHieu}
          onChange={(e) => setThuongHieu(e.target.value)}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Nhập thương hiệu"
          required
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <div>
          <p className="mb-2">Giá bán</p>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-40 px-3 py-2"
            type="number"
            placeholder="Nhập giá bán"
            required
          />
        </div>

        <div>
          <p className="mb-2">Giá nhập</p>
          <input
            value={giaNhap}
            onChange={(e) => setGiaNhap(e.target.value)}
            className="w-40 px-3 py-2"
            type="number"
            placeholder="Nhập giá nhập"
            required
          />
        </div>

        <div>
          <p className="mb-2">Giá gốc</p>
          <input
            value={giaGoc}
            onChange={(e) => setGiaGoc(e.target.value)}
            className="w-40 px-3 py-2"
            type="number"
            placeholder="Nhập giá gốc"
            required
          />
        </div>

        <div>
          <p className="mb-2">Số lượng</p>
          <input
            value={soLuong}
            onChange={(e) => setSoLuong(e.target.value)}
            className="w-40 px-3 py-2"
            type="number"
            placeholder="Số lượng"
            required
          />
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2">Danh mục</p>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full max-w-[500px] px-3 py-2"
        >
          <option value="Điện thoại">Điện thoại</option>
          <option value="Máy tính bảng">Máy tính bảng</option>
          <option value="Laptop">Laptop</option>
          <option value="Phụ kiện">Phụ kiện</option>
          <option value="Smart Watch">Smart Watch</option>
          <option value="TV">TV</option>
        </select>
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="checkbox"
          checked={bestseller}
          onChange={() => setBestseller((prev) => !prev)}
        />
        <label>Thêm vào danh sách bán chạy</label>
      </div>

      <button type="submit" className="w-28 py-3 mt-4 bg-rose-400 text-white">
        THÊM
      </button>
    </form>
  );
};

export default Add;
