// src/services/RoleService.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

/**
 * Fetch the user's role from the backend
 * @returns {Promise<Object>} User role information
 */
export const fetchUserRole = async () => {
  try {
    const token = localStorage.getItem('oauth_token');
    
    if (!token) {
      throw new Error('No access token available');
    }
    
    const response = await axios.get(`${API_URL}/user/role`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.data || !response.data.success) {
      throw new Error('Failed to fetch role information');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user role:', error);
    throw error;
  }
};

/**
 * Map a GID to a role name
 * @param {string} gid - Group ID from backend
 * @returns {string} Role name
 */
export const mapGidToRole = (gid) => {
  const roleMap = 
      // teacher
  {
    '70': 'department',
    '60': 'supervisor',
    '5': 'student',
    '80': 'teacher'
  }
        // student
  // {
  //   '70': 'department',
  //   '60': 'supervisor',
  //   '5': 'student',
  //   '80': 'teacher'
  // }
        // supervisor
  // {
  //   '70': 'department',
  //   '5': 'supervisor',
  //   '80': 'student',
  //   '60': 'teacher'
  // }
      // department
  // {
  //   '5': 'department',
  //   '70': 'supervisor',
  //   '80': 'student',
  //   '60': 'teacher'
  // }



  
  return roleMap[gid] || 'unknown';
};