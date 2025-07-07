import multer from 'multer';

// Sử dụng cấu hình mặc định để lưu trữ tạm thời
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    // Đặt tên file gốc
    callback(null, file.originalname);
  }
});

// Multer sẽ lưu file vào thư mục tạm thời của hệ điều hành
const upload = multer({ storage: storage });

export default upload;
