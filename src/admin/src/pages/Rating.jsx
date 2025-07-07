import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from "../App";

const Rating = () => {
  const [reviews, setReviews] = useState([]);
  const [productSummary, setProductSummary] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [replyTextByReview, setReplyTextByReview] = useState({});

  // Hàm fetchReviews để tái sử dụng
  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/review/get`);
      if (response.data.success) {
        setReviews(response.data.reviews);
      } else {
        console.warn(response.data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Lấy toàn bộ review lần đầu
  useEffect(() => {
    fetchReviews();
  }, []);

  // Gom review theo sản phẩm + include replies
  useEffect(() => {
    const productMap = {};
    reviews.forEach((rev) => {
      if (rev.items && Array.isArray(rev.items)) {
        rev.items.forEach((item) => {
          const name = item.name || "Sản phẩm không tên";
          if (!productMap[name]) {
            productMap[name] = {
              totalReviews: 0,
              totalStars: 0,
              image: item.image?.[0] || null,
              reviews: []
            };
          }
          productMap[name].totalReviews += 1;
          productMap[name].totalStars += rev.rating;
          productMap[name].reviews.push({
            ...rev,
            replies: rev.replies || []
          });
        });
      }
    });

    const summary = Object.keys(productMap).map((productName) => {
      const data = productMap[productName];
      return {
        name: productName,
        reviewCount: data.totalReviews,
        averageRating: (data.totalStars / data.totalReviews).toFixed(1),
        image: data.image,
        reviews: data.reviews
      };
    });
    summary.sort((a, b) => b.reviewCount - a.reviewCount);
    setProductSummary(summary);
  }, [reviews]);

const handleToggleReply = async (orderId, reviewId, replyId, isHidden) => {
  try {
    const url = isHidden
      ? `${backendUrl}/api/review/${orderId}/reviews/${reviewId}/replies/${replyId}/unhide`
      : `${backendUrl}/api/review/${orderId}/reviews/${reviewId}/replies/${replyId}/hide`;
    const response = await axios.post(url);
    if (response.data.success) {
      // Cập nhật state để re-render ngay
      setReviews(prev =>
        prev.map(r => {
          if (r.orderId === orderId && r.reviewId === reviewId) {
            return {
              ...r,
              replies: r.replies.map(rep =>
                rep._id === replyId ? { ...rep, isHidden: !isHidden } : rep
              )
            };
          }
          return r;
        })
      );
    } else {
      alert(response.data.message);
    }
  } catch (err) {
    console.error(err);
    alert('Lỗi khi thay đổi trạng thái reply');
  }
};

  // Thay đổi trạng thái ẩn/bỏ ẩn
  const handleToggleReview = async (orderId, reviewId, isHidden) => {
    try {
      const url = isHidden
        ? `${backendUrl}/api/review/unhide`
        : `${backendUrl}/api/review/hide`;
      const response = await axios.patch(url, { orderId, reviewId });
      if (response.data.success) {
        // Cập nhật ngay lập tức chỉ ẩn comment user
        setReviews(prev => prev.map(r =>
          r.orderId === orderId && r.reviewId === reviewId
            ? { ...r, isHidden: !isHidden }
            : r
        ));
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi thay đổi trạng thái ẩn review');
    }
  };

  // Quản lý input reply
  const handleReplyChange = (reviewId, text) => {
    setReplyTextByReview(prev => ({ ...prev, [reviewId]: text }));
  };

  // Gửi reply
  const handleSubmitReply = async (orderId, reviewId) => {
    const replyText = replyTextByReview[reviewId]?.trim();
    if (!replyText) return alert('Vui lòng nhập nội dung trả lời');
    try {
      const response = await axios.post(
        `${backendUrl}/api/review/${orderId}/reviews/${reviewId}/reply`,
        { replyText }
      );
      if (response.data.success) {
        await fetchReviews();
        setReplyTextByReview(prev => ({ ...prev, [reviewId]: '' }));
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi gửi reply');
    }
  };

  if (loading) return <div>Đang tải đánh giá...</div>;
  if (productSummary.length === 0) return <div>Chưa có đánh giá nào</div>;

  const filteredProducts = productSummary.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="rating-container">
      <h2>Đánh giá sản phẩm</h2>
      <input
        type="text"
        placeholder="🔍 Tìm tên sản phẩm..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc', marginBottom: 20 }}
      />

      {filteredProducts.map((product, idx) => (
        <div key={idx} style={{ padding: 16, marginBottom: 16, borderRadius: 8, backgroundColor: '#fafafa', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            {product.image && <img src={product.image} alt={product.name} style={{ width:80, height:80, borderRadius:8, objectFit:'cover', marginRight:16 }} />}
            <div>
              <div style={{ fontSize:'1.25rem', fontWeight:'bold' }}>{product.name}</div>
              <div>
                {renderStars(product.averageRating)}
                <span style={{ marginLeft:8 }}>{product.averageRating}/5</span>
                <span style={{ marginLeft:12 }}>({product.reviewCount} đánh giá)</span>
              </div>
            </div>
          </div>

          {product.reviews.map((rev, i) => (
            <div key={i} style={{ padding:12, marginBottom:12, borderRadius:4, backgroundColor: '#fff' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontWeight:'bold', opacity: rev.isHidden ? 0.5 : 1 }}>
                  {rev.firstName} {rev.lastName} {renderStars(rev.rating)}
                  {rev.isHidden && <span style={{ marginLeft:8, color:'red' }}>(Đã ẩn)</span>}
                </div>
                <button onClick={() => handleToggleReview(rev.orderId, rev.reviewId, rev.isHidden)} style={{ padding:'6px 12px', border:'none', borderRadius:4, backgroundColor: rev.isHidden? '#2ecc71':'#e74c3c', color:'#fff', cursor:'pointer' }}>
                  {rev.isHidden? 'Bỏ ẩn':'Ẩn'}
                </button>
              </div>

              {/* Comment user luôn hiển thị nhưng mờ nếu ẩn */}
              <div style={{ marginTop:8, opacity: rev.isHidden ? 0.5 : 1 }}>
                {rev.comment}
              </div>
              <small style={{ color:'#555' }}>{new Date(rev.createdAt).toLocaleString()}</small>

              {/* Replies luôn hiển thị, không ẩn */}
<div style={{ marginTop: 12, paddingLeft: 16 }}>
  {(rev.replies || []).map((rep, j) => (
    <div
      key={j}
      style={{
        marginBottom: 8,
        opacity: rep.isHidden ? 0.5 : 1,       // ← mờ nếu isHidden
        fontStyle: rep.isHidden ? 'italic' : 'normal'  // ví dụ thêm italic
      }}
    >
      <strong>Admin:</strong> {rep.replyText}{' '}
      <small>({new Date(rep.createdAt).toLocaleString()})</small>

      <button
        style={{
          marginLeft: 8,
          padding: '2px 6px',
          fontSize: 12,
          border: 'none',
          borderRadius: 4,
          backgroundColor: rep.isHidden ? '#2ecc71' : '#e74c3c',
          color: '#fff',
          cursor: 'pointer'
        }}
        onClick={() => handleToggleReply(
          rev.orderId,
          rev.reviewId,
          rep._id,
          rep.isHidden
        )}
      >
        {rep.isHidden ? 'Hiện reply' : 'Ẩn reply'}
      </button>
    </div>
  ))}
</div>
  

              {/* Form reply luôn hiển thị */}
              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                <input
                  type="text"
                  placeholder="Viết trả lời..."
                  value={replyTextByReview[rev.reviewId]||''}
                  onChange={e => handleReplyChange(rev.reviewId, e.target.value)}
                  style={{ flex:1, padding:6, borderRadius:4, border:'1px solid #ccc' }}
                />
                <button onClick={() => handleSubmitReply(rev.orderId, rev.reviewId)} style={{ padding:'6px 12px', border:'none', borderRadius:4, backgroundColor:'#3498db', color:'#fff', cursor:'pointer' }}>
                  Trả lời
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const renderStars = rating => {
  const full = Math.floor(rating);
  const stars = [];
  for (let i=0; i<5; i++) stars.push(
    <span key={i} style={{ color: i<full? '#facc15':'#d1d5db' }}>★</span>
  );
  return stars;
};

export default Rating;