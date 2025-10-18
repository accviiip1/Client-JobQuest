import { useState, useEffect } from 'react';
import { makeRequest } from '../axios';

// Service để lấy dữ liệu từ API thay vì file data.js
export const lookupDataService = {
  // Lấy tất cả categories có sẵn
  getAvailableCategories: async () => {
    try {
      const response = await makeRequest.get('/lookup-data/categories');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Lấy dữ liệu theo category
  getDataByCategory: async (category) => {
    try {
      const response = await makeRequest.get(`/lookup-data/category/${category}`);
      const rawData = response.data.data;
      
      // Convert to legacy format based on category
      switch (category) {
        case 'typeWorks':
          return rawData.map(item => ({
            id: item.item_id,
            name: item.name
          }));
        case 'educationJob':
          return rawData.map(item => ({
            id: item.item_id,
            name: item.name,
            value: item.value
          }));
        case 'experienceJob':
          return rawData.map(item => ({
            id: item.item_id,
            name: item.name
          }));
        case 'scale':
          return rawData.map(item => ({
            value: item.value,
            label: item.label,
            name: item.name
          }));
        case 'statusUser':
          return rawData.map(item => ({
            id: item.item_id,
            value: item.value,
            label: item.label,
            name: item.name,
            icon: getIconByStatus(item.value)
          }));
        case 'statusCompany':
          return rawData.map(item => ({
            id: item.item_id,
            value: item.value,
            label: item.label,
            name: item.name,
            icon: getIconByStatus(item.value)
          }));
        case 'sexData':
          return rawData.map(item => ({
            id: item.item_id,
            name: item.name,
            value: item.value
          }));
        case 'categories':
          return rawData.map(item => ({
            link: item.link,
            text: item.text,
            icon: item.icon
          }));
        default:
          return rawData;
      }
    } catch (error) {
      console.error(`Error fetching ${category} data:`, error);
      return [];
    }
  },

  // Lấy item cụ thể
  getItem: async (category, itemId) => {
    try {
      const response = await makeRequest.get(`/lookup-data/item/${category}/${itemId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching item ${category}/${itemId}:`, error);
      return null;
    }
  }
};

// Hooks để sử dụng trong React components
export const useLookupData = (category) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await lookupDataService.getDataByCategory(category);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (category) {
      fetchData();
    }
  }, [category]);

  return { data, loading, error, refetch: fetchData };
};

// Utility functions để convert từ database format sang format cũ
export const convertToLegacyFormat = {
  // Convert typeWorks
  typeWorks: (dbData) => dbData.map(item => ({
    id: item.item_id,
    name: item.name
  })),

  // Convert educationJob
  educationJob: (dbData) => dbData.map(item => ({
    id: item.item_id,
    name: item.name,
    value: item.value
  })),

  // Convert experienceJob
  experienceJob: (dbData) => dbData.map(item => ({
    id: item.item_id,
    name: item.name
  })),

  // Convert scale
  scale: (dbData) => dbData.map(item => ({
    value: item.value,
    label: item.label,
    name: item.name
  })),

  // Convert statusUser
  statusUser: (dbData) => dbData.map(item => ({
    id: item.item_id,
    value: item.value,
    label: item.label,
    name: item.name,
    icon: getIconByStatus(item.value) // Helper function để lấy icon
  })),

  // Convert statusCompany
  statusCompany: (dbData) => dbData.map(item => ({
    id: item.item_id,
    value: item.value,
    label: item.label,
    name: item.name,
    icon: getIconByStatus(item.value)
  })),

  // Convert sexData
  sexData: (dbData) => dbData.map(item => ({
    id: item.item_id,
    name: item.name,
    value: item.value
  })),

  // Convert categories
  categories: (dbData) => dbData.map(item => ({
    link: item.link,
    text: item.text,
    icon: item.icon
  }))
};

// Helper function để lấy icon theo status
const getIconByStatus = (status) => {
  const iconMap = {
    'Đã gửi hồ sơ': <i className="fa-regular fa-envelope"></i>,
    'Đã xem hồ sơ': <i className="fa-regular fa-eye"></i>,
    'Phỏng vấn': <i className="fa-solid fa-clipboard-question"></i>,
    'Từ chối': <i className="fa-regular fa-circle-xmark"></i>,
    'Chấp nhận': <i className="fa-regular fa-circle-check"></i>,
    'Chưa xem': <i className="fa-regular fa-eye-slash"></i>
  };
  return iconMap[status] || null;
};

// Cached data để tránh gọi API nhiều lần
const cache = new Map();

export const getCachedLookupData = async (category) => {
  if (cache.has(category)) {
    return cache.get(category);
  }

  const data = await lookupDataService.getDataByCategory(category);
  cache.set(category, data);
  return data;
};

// Clear cache khi cần
export const clearLookupCache = (category = null) => {
  if (category) {
    cache.delete(category);
  } else {
    cache.clear();
  }
};
