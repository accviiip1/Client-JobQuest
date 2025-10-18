import React, { useState, useEffect } from "react";
import { makeRequest } from "../../axios";
import { Link } from "react-router-dom";
import "./careerGuide.scss";

export default function CareerGuide() {
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const postsPerPage = 6; // Hiển thị 6 bài viết mỗi trang

  // Function tìm kiếm
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await makeRequest.get(`/posts?search=${encodeURIComponent(query)}&limit=20`);
      setSearchResults(response.data.data || []);
    } catch (error) {
      console.error('Error searching posts:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Load posts từ API
  useEffect(() => {
    const loadPosts = async () => {
      try {
        // Load bài viết có nhiều lượt xem nhất
        const topViewedResponse = await makeRequest.get('/posts?sort=view_count&order=desc&limit=3');
        setFeaturedPosts(topViewedResponse.data.data);

        // Load bài viết với phân trang
        const postsResponse = await makeRequest.get(`/posts?page=${currentPage}&limit=${postsPerPage}&sort=created_at&order=desc`);
        setPosts(postsResponse.data.data);
        setTotalPages(postsResponse.data.pagination?.totalPages || 1);
        setTotalPosts(postsResponse.data.pagination?.totalItems || 0);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [currentPage]);

  if (loading) {
    return (
      <div className="careerGuide">
        <div className="container">
          <div className="loading">Đang tải...</div>
        </div>
      </div>
    );
  }
  return (
    <div className="careerGuide">
      <div className="container">
        <div className="careerGuide__wrapper">
          <div className="careerGuide__wrapper__header">
            <h1>Cẩm nang</h1>
            <p>Khám phá những bí quyết và kinh nghiệm hữu ích để phát triển sự nghiệp của bạn</p>
            
            {/* Thanh tìm kiếm */}
            <div className="search-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="search-input"
                />
                <button className="search-btn">
                  <i className="fa-solid fa-search"></i>
                </button>
              </div>
              
              {/* Kết quả tìm kiếm */}
              {searchQuery && (
                <div className="search-results">
                  {isSearching ? (
                    <div className="search-loading">
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Đang tìm kiếm...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="search-results-list">
                      <h4>Tìm thấy {searchResults.length} kết quả cho "{searchQuery}"</h4>
                      {searchResults.slice(0, 5).map((post) => (
                        <Link key={post.id} to={`/cam-nang-nghe-nghiep/${post.slug}`} className="search-result-item">
                          <div className="result-image">
                            {post.featured_image ? (
                              <img src={post.featured_image} alt={post.title} />
                            ) : (
                              <i className="fa-solid fa-file-alt"></i>
                            )}
                          </div>
                          <div className="result-content">
                            <h5>{post.title}</h5>
                            <p>{post.excerpt}</p>
                            <div className="result-meta">
                              <span className="result-category">
                                {post.category === 'career-guide' ? 'Cẩm nang' :
                                 post.category === 'job-tips' ? 'Bí kíp tìm việc' : 'Thông tin ngành'}
                              </span>
                              <span className="result-date">
                                {new Date(post.created_at).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                      {searchResults.length > 5 && (
                        <div className="search-more">
                          <button 
                            className="view-all-results"
                            onClick={() => {
                              // Có thể mở modal hoặc chuyển trang để hiển thị tất cả kết quả
                              console.log('View all results');
                            }}
                          >
                            Xem tất cả {searchResults.length} kết quả
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="search-no-results">
                      <i className="fa-solid fa-search"></i>
                      Không tìm thấy bài viết nào cho "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="careerGuide__wrapper__content">
            <div className="row">
              <div className="col pc-8 t-12 m-12">
                <div className="careerGuide__wrapper__content__main">
                  {/* Kỹ năng quan trọng */}
                  <section className="career-section">
                    <h2>
                      <i className="fa-solid fa-star"></i>
                      Kỹ năng quan trọng
                    </h2>
                    <div className="skills-grid">
                      <div className="skill-card">
                        <div className="skill-icon">
                          <i className="fa-solid fa-lightbulb"></i>
                        </div>
                        <h3>Tư duy phản biện</h3>
                        <p>Phân tích và đánh giá thông tin một cách logic và khách quan.</p>
                      </div>
                      <div className="skill-card">
                        <div className="skill-icon">
                          <i className="fa-solid fa-clock"></i>
                        </div>
                        <h3>Quản lý thời gian</h3>
                        <p>Sắp xếp và ưu tiên công việc để đạt hiệu quả cao nhất.</p>
                      </div>
                    </div>
                  </section>

                  {/* CV và phỏng vấn */}
                  <section className="career-section">
                    <h2>
                      <i className="fa-solid fa-file-pen"></i>
                      CV và phỏng vấn
                    </h2>
                    <div className="tips-list">
                      <div className="tip-item">
                        <div className="tip-number">1</div>
                        <div className="tip-content">
                          <h3>Viết CV chuyên nghiệp</h3>
                          <p>CV cần ngắn gọn, rõ ràng và tập trung vào những thành tích nổi bật. Sử dụng từ khóa liên quan đến vị trí ứng tuyển.</p>
                        </div>
                      </div>
                      <div className="tip-item">
                        <div className="tip-number">2</div>
                        <div className="tip-content">
                          <h3>Chuẩn bị cho phỏng vấn</h3>
                          <p>Nghiên cứu về công ty, chuẩn bị câu trả lời cho các câu hỏi thường gặp và thực hành trước gương.</p>
                        </div>
                      </div>
                      <div className="tip-item">
                        <div className="tip-number">3</div>
                        <div className="tip-content">
                          <h3>Thể hiện sự tự tin</h3>
                          <p>Giữ tư thế thẳng, giao tiếp bằng mắt và thể hiện sự nhiệt tình với công việc.</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Danh sách bài viết */}
                  <section className="career-section">
                    <h2>
                      <i className="fa-solid fa-newspaper"></i>
                      Bài viết mới nhất
                    </h2>
                    <div className="posts-grid">
                      {posts.map((post) => (
                        <Link key={post.id} to={`/cam-nang-nghe-nghiep/${post.slug}`} className="post-card">
                          <div className="post-image">
                            {post.featured_image ? (
                              <img src={post.featured_image} alt={post.title} />
                            ) : (
                              <div className="post-icon">
                                <i className="fa-solid fa-file-alt"></i>
                              </div>
                            )}
                            <div className="post-category">
                              {post.category === 'career-guide' ? 'Cẩm nang' :
                               post.category === 'job-tips' ? 'Bí kíp tìm việc' : 'Thông tin ngành'}
                            </div>
                          </div>
                          <div className="post-content">
                            <h3>{post.title}</h3>
                            <p>{post.excerpt}</p>
                            <div className="post-meta">
                              <span className="post-date">
                                <i className="fa-solid fa-calendar"></i>
                                {new Date(post.created_at).toLocaleDateString('vi-VN')}
                              </span>
                              <span className="post-views">
                                <i className="fa-solid fa-eye"></i>
                                {post.view_count}
                              </span>
                            </div>
                            {post.tags && post.tags.length > 0 && (
                              <div className="post-tags">
                                {post.tags.slice(0, 3).map((tag, index) => (
                                  <span key={index} className="tag">{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    {/* Phân trang */}
                    {totalPages > 1 && (
                      <div className="pagination">
                        <div className="pagination-info">
                          Hiển thị {((currentPage - 1) * postsPerPage) + 1}-{Math.min(currentPage * postsPerPage, totalPosts)} trong tổng số {totalPosts} bài viết
                        </div>
                        <div className="pagination-controls">
                          <button 
                            className="pagination-btn"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            <i className="fa-solid fa-chevron-left"></i>
                            Trước
                          </button>
                          
                          <div className="pagination-numbers">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <button
                                key={page}
                                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </button>
                            ))}
                          </div>
                          
                          <button 
                            className="pagination-btn"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          >
                            Sau
                            <i className="fa-solid fa-chevron-right"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              </div>

              <div className="col pc-4 t-12 m-12">
                <div className="careerGuide__wrapper__content__sidebar">
                  {/* Các bài viết nhiều lượt xem nhất */}
                  <div className="sidebar-section">
                    <h3>
                      <i className="fa-solid fa-fire"></i>
                      Bài viết nhiều lượt xem nhất
                    </h3>
                    <div className="article-list">
                      {featuredPosts.map((post, index) => (
                        <Link key={post.id} to={`/cam-nang-nghe-nghiep/${post.slug}`} className="article-item">
                          <div className="article-thumbnail">
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
                            ) : (
                              <i className="fa-solid fa-file-lines"></i>
                            )}
                          </div>
                          <div className="article-content">
                            <h4>{post.title}</h4>
                            <p>{post.excerpt}</p>
                            <div className="article-meta">
                              <span className="view-count">
                                <i className="fa-solid fa-eye"></i>
                                {post.view_count} lượt xem
                              </span>
                              <span className="category-badge">
                                {post.category === 'career-guide' ? 'Cẩm nang' :
                                 post.category === 'job-tips' ? 'Bí kíp' : 'Thông tin'}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Thống kê thị trường */}
                  <div className="sidebar-section">
                    <h3>
                      <i className="fa-solid fa-chart-bar"></i>
                      Thống kê thị trường
                    </h3>
                    <div className="stats-list">
                      <div className="stat-item">
                        <div className="stat-number">85%</div>
                        <div className="stat-label">Ứng viên có kỹ năng mềm tốt được tuyển dụng</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-number">72%</div>
                        <div className="stat-label">Nhà tuyển dụng quan tâm đến kinh nghiệm</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-number">68%</div>
                        <div className="stat-label">Ứng viên có CV chuyên nghiệp được phỏng vấn</div>
                      </div>
                    </div>
                  </div>

                  {/* Liên kết hữu ích */}
                  <div className="sidebar-section">
                    <h3>
                      <i className="fa-solid fa-link"></i>
                      Liên kết hữu ích
                    </h3>
                    <div className="useful-links">
                      <Link to="/tim-kiem" className="useful-link">
                        <i className="fa-solid fa-graduation-cap"></i>
                        <span>Khóa học kỹ năng mềm</span>
                      </Link>
                      <Link to="/tim-viec-lam-nhanh" className="useful-link">
                        <i className="fa-solid fa-file-alt"></i>
                        <span>Mẫu CV chuyên nghiệp</span>
                      </Link>
                      <Link to="/cam-nang-nghe-nghiep" className="useful-link">
                        <i className="fa-solid fa-comments"></i>
                        <span>Tips phỏng vấn</span>
                      </Link>
                      <Link to="/nha-tuyen-dung" className="useful-link">
                        <i className="fa-solid fa-chart-line"></i>
                        <span>Xu hướng nghề nghiệp</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
