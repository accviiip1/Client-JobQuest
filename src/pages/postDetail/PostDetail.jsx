import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { makeRequest } from '../../axios';
import Loading from '../../components/loading/Loading';
import './PostDetail.scss';

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        
        // Load bài viết chính
        const postResponse = await makeRequest.get(`/posts/slug/${slug}`);
        setPost(postResponse.data.data);

        // Load bài viết liên quan
        const relatedResponse = await makeRequest.get(
          `/posts/related?id=${postResponse.data.data.id}&category=${postResponse.data.data.category}&limit=3`
        );
        setRelatedPosts(relatedResponse.data.data);

      } catch (error) {
        console.error('Error loading post:', error);
        setError('Không tìm thấy bài viết');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="postDetail">
        <div className="container">
          <Loading text="Đang tải bài viết..." />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="postDetail">
        <div className="container">
          <div className="error">
            <h2>Không tìm thấy bài viết</h2>
            <p>Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Link to="/cam-nang-nghe-nghiep" className="btn btn-primary">
              Quay lại cẩm nang
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="postDetail">
      <div className="container">
        <div className="postDetail__wrapper">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <Link to="/cam-nang-nghe-nghiep">Cẩm nang</Link>
            <span>/</span>
            <span>{post.title}</span>
          </nav>

          <div className="row">
            <div className="col pc-8 t-12 m-12">
              <article className="post-content">
                {/* Header */}
                <header className="post-header">
                  <div className="post-meta">
                    <span className="post-category">
                      {post.category === 'career-guide' ? 'Cẩm nang' :
                       post.category === 'job-tips' ? 'Bí kíp tìm việc' : 'Thông tin ngành'}
                    </span>
                    <span className="post-date">
                      <i className="fa-solid fa-calendar"></i>
                      {new Date(post.created_at).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="post-views">
                      <i className="fa-solid fa-eye"></i>
                      {post.view_count} lượt xem
                    </span>
                  </div>
                  
                  <h1 className="post-title">{post.title}</h1>
                  
                  {post.excerpt && (
                    <p className="post-excerpt">{post.excerpt}</p>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="post-tags">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </header>

                {/* Featured Image */}
                {post.featured_image && (
                  <div className="post-featured-image">
                    <img src={post.featured_image} alt={post.title} />
                  </div>
                )}

                {/* Content */}
                <div 
                  className="post-body"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Author Info */}
                {post.author_name && (
                  <div className="post-author">
                    <div className="author-info">
                      <div className="author-avatar">
                        <i className="fa-solid fa-user"></i>
                      </div>
                      <div className="author-details">
                        <h4>Tác giả: {post.author_name}</h4>
                        <p>Chuyên gia tư vấn nghề nghiệp</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Share Buttons */}
                <div className="post-share">
                  <h4>Chia sẻ bài viết:</h4>
                  <div className="share-buttons">
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="share-btn facebook"
                    >
                      <i className="fa-brands fa-facebook"></i>
                      Facebook
                    </a>
                    <a 
                      href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${post.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="share-btn twitter"
                    >
                      <i className="fa-brands fa-twitter"></i>
                      Twitter
                    </a>
                    <a 
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="share-btn linkedin"
                    >
                      <i className="fa-brands fa-linkedin"></i>
                      LinkedIn
                    </a>
                  </div>
                </div>
              </article>
            </div>

            <div className="col pc-4 t-12 m-12">
              <aside className="post-sidebar">
                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <div className="sidebar-section">
                    <h3>
                      <i className="fa-solid fa-newspaper"></i>
                      Bài viết liên quan
                    </h3>
                    <div className="related-posts">
                      {relatedPosts.map((relatedPost) => (
                        <Link 
                          key={relatedPost.id} 
                          to={`/cam-nang-nghe-nghiep/${relatedPost.slug}`}
                          className="related-post"
                        >
                          <div className="related-post-image">
                            {relatedPost.featured_image ? (
                              <img src={relatedPost.featured_image} alt={relatedPost.title} />
                            ) : (
                              <div className="related-post-icon">
                                <i className="fa-solid fa-file-alt"></i>
                              </div>
                            )}
                          </div>
                          <div className="related-post-content">
                            <h4>{relatedPost.title}</h4>
                            <div className="related-post-meta">
                              <span className="related-post-date">
                                {new Date(relatedPost.created_at).toLocaleDateString('vi-VN')}
                              </span>
                              <span className="related-post-views">
                                <i className="fa-solid fa-eye"></i>
                                {relatedPost.view_count}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Links */}
                <div className="sidebar-section">
                  <h3>
                    <i className="fa-solid fa-link"></i>
                    Liên kết nhanh
                  </h3>
                  <div className="quick-links">
                    <Link to="/tim-kiem" className="quick-link">
                      <i className="fa-solid fa-search"></i>
                      <span>Tìm việc làm</span>
                    </Link>
                    <Link to="/nha-tuyen-dung" className="quick-link">
                      <i className="fa-solid fa-building"></i>
                      <span>Danh sách công ty</span>
                    </Link>
                    <Link to="/tim-viec-lam-nhanh" className="quick-link">
                      <i className="fa-solid fa-briefcase"></i>
                      <span>Tìm việc nhanh</span>
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
