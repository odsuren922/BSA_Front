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

    // notification.error({
    //   message: "Request Failed",
    //   description: errorMessage,
    //   duration: 5
    // });

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

    // notification.error({
    //   message: "Request Failed",
    //   description: errorMessage,
    //   duration: 5
    // });

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
