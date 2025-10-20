import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { makeRequest } from "../../axios";
import Loading from "../loading/Loading";
import "./SectionPopularPosts.scss";

export default function SectionPopularPosts() {
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        // Chỉ lấy 3 bài viết nhiều view nhất
        const response = await makeRequest.get('/posts?sort=view_count&order=desc&limit=3&status=published');
        
        setPopularPosts(response.data.data || []);
      } catch (error) {
        console.error('Error fetching popular posts:', error);
        // Fallback: lấy bài viết mới nhất
        try {
          const response = await makeRequest.get('/posts?sort=created_at&order=desc&limit=3&status=published');
          setPopularPosts(response.data.data);
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPosts();
  }, []);

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'career-guide':
        return 'Cẩm nang';
      case 'job-tips':
        return 'Bí kíp tìm việc';
      case 'industry-insights':
        return 'Thông tin ngành';
      default:
        return category;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="section-popular-posts">
        <div className="container">
          <div className="section-popular-posts__header">
            <h2>
              <i className="fa-solid fa-fire"></i> Bài viết nhiều lượt xem nhất
            </h2>
          </div>
          <Loading 
            text="Đang tải bài viết..." 
            size="large"
            className="popular-posts-loading"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="section-popular-posts">
      <div className="container">
        <div className="section-popular-posts__header">
          <h2>
            <i className="fa-solid fa-fire"></i> Bài viết nhiều lượt xem nhất
          </h2>
          <Link to="/cam-nang-nghe-nghiep" className="view-all">
            Xem tất cả <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
        
        <div className="section-popular-posts__body">
          <div className="row">
            {popularPosts.map((post, index) => (
              <div key={post.id} className="col pc-4 t-6 m-12">
                <div className="post-card">
                  <div className="post-card__image">
                    {post.featured_image ? (
                      <img 
                        src={post.featured_image.startsWith('http') ? 
                          post.featured_image : 
                          `http://localhost:8800${post.featured_image}`} 
                        alt={post.title}
                        onError={(e) => {
                          // Thử load từ uploads/posts nếu URL gốc lỗi
                          const filename = post.featured_image.split('/').pop();
                          const fallbackUrl = `http://localhost:8800/images/${filename}`;
                          e.target.src = fallbackUrl;
                        }}
                      />
                    ) : null}
                    <div className="no-image" style={{display: post.featured_image ? 'none' : 'flex'}}>
                      <i className="fa-solid fa-file-lines"></i>
                    </div>
                    <div className="post-card__category">
                      {getCategoryLabel(post.category)}
                    </div>
                  </div>
                  
                  <div className="post-card__content">
                    <h3 className="post-card__title">
                      <Link to={`/cam-nang-nghe-nghiep/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    
                    <p className="post-card__excerpt">
                      {post.excerpt}
                    </p>
                    
                    <div className="post-card__meta">
                      <div className="post-card__views">
                        <i className="fa-solid fa-eye"></i>
                        <span>{post.view_count} lượt xem</span>
                      </div>
                      <div className="post-card__date">
                        <i className="fa-solid fa-calendar"></i>
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


