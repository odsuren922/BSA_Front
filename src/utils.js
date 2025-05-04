<<<<<<< HEAD
import axios from "axios";

const API_URL = "http://127.0.0.1:8000"; // API серверийн үндсэн URL-ийг зааж өгнө.

axios.defaults.withCredentials = true; // Күүки болон бусад authentication мэдээллийг илгээхийн тулд "withCredentials"-г идэвхжүүлнэ.

// CSRF токен олох хэсэг
const csrfTokenElement = document.querySelector('meta[name="csrf-token"]');
if (csrfTokenElement) {
  // Хэрэв CSRF токен meta tag-аас олдвол axios-ийн headers-д автоматаар нэмнэ.
  const csrfToken = csrfTokenElement.getAttribute("content");
  axios.defaults.headers.common["X-CSRF-TOKEN"] = csrfToken;
} else {
  // Хэрэв CSRF токен олдохгүй бол анхааруулга харуулна.
  console.warn("CSRF токен meta tag-аас олдсонгүй.");
}

// Өгөгдөл авах функц
export const fetchData = async (endpoint, params = {}) => {
  try {
    // API-с өгөгдөл татах GET хүсэлт илгээнэ.
    const response = await axios.get(`${API_URL}/${endpoint}`, {
      params: params, // Хүсэлтийн параметрүүдийг дамжуулна.
    });
    return response.data; // Хариу өгөгдлийг буцаана.
  } catch (error) {
    // Алдаа гарвал console дээр харуулна.
    console.log("Өгөгдөл татах үед алдаа гарлаа:", error);
    throw error; // Алдааг шидэж, дээд түвшинд мэдээлнэ.
  }
};

// Өгөгдөл илгээх функц
export const postData = async (endpoint, data, method = "post") => {
  try {
    // API-д өгөгдөл илгээх хүсэлт илгээнэ. Method-г POST эсвэл PUT сонгож болно.
    const response = await axios({
      method: method, // HTTP хүсэлтийн аргыг зааж өгнө (жишээ нь: POST, PUT).
      url: `${API_URL}/${endpoint}`, // Хүсэлтийг илгээх API замыг тодорхойлно.
      data: data, // Илгээж буй өгөгдөл.
      headers: {
        "X-CSRF-TOKEN": axios.defaults.headers.common["X-CSRF-TOKEN"], // CSRF хамгаалалтыг headers-д оруулна.
      },
    });
    return response.data; // Хариу өгөгдлийг буцаана.
  } catch (error) {
    // Алдаа гарвал console дээр харуулна.
    console.log("Өгөгдөл илгээх үед алдаа гарлаа:", error);
    throw error; // Алдааг шидэж, дээд түвшинд мэдээлнэ.
  }
};
=======
import api from "./api/axios";
import { notification } from "antd";

/**
 * GET request
 */
export const fetchData = async (endpoint, params = {}) => {
  try {
    const response = await api.get(`/api/${endpoint}`, { params });
    const responseData = response.data?.data ?? response.data;
    return responseData;
  } catch (error) {
    console.error("Error fetching data:", error);

    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'An unexpected error occurred';

    notification.error({
      message: "Request Failed",
      description: errorMessage,
      duration: 5
    });

    throw error;
  }
};

/**
 * POST/PUT/DELETE request — CSRF cookie-г заавал авна
 */
export const postData = async (endpoint, data = {}, method = "post") => {
  try {
    if (["post", "put", "delete"].includes(method.toLowerCase())) {
      // ✅ CSRF cookie-г амжиж татах
      await api.get('/sanctum/csrf-cookie');
    }

    let response;
    if (method.toLowerCase() === "post") {
      response = await api.post(`/api/${endpoint}`, data);
    } else if (method.toLowerCase() === "put") {
      response = await api.put(`/api/${endpoint}`, data);
    } else if (method.toLowerCase() === "delete") {
      response = await api.delete(`/api/${endpoint}`, { data });
    } else {
      throw new Error(`Unsupported method: ${method}`);
    }

    if (response.data?.message) {
      notification.success({
        message: "Success",
        description: response.data.message,
        duration: 3
      });
    }

    return response.data?.data ?? response.data;
  } catch (error) {
    console.error(`Error ${method} data:`, error);

    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'An unexpected error occurred';

    notification.error({
      message: "Request Failed",
      description: errorMessage,
      duration: 5
    });

    throw error;
  }
};

/**
 * Format data
 */
export const formatData = (value, type = 'text') => {
  if (value === null || value === undefined) return '-';

  switch (type) {
    case 'date': return new Date(value).toLocaleDateString();
    case 'datetime': return new Date(value).toLocaleString();
    case 'boolean': return value ? 'Yes' : 'No';
    case 'number': return typeof value === 'number' ? value.toLocaleString() : value;
    default: return value;
  }
};

/**
 * Parse JSON safely
 */
export const safeParseJSON = (jsonString, defaultValue = {}) => {
  try {
    return typeof jsonString === 'string' 
      ? JSON.parse(jsonString) 
      : jsonString || defaultValue;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return defaultValue;
  }
};

/**
 * Check if a value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
