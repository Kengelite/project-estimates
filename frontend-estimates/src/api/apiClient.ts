import axios from 'axios';

// 1. สร้าง Instance ของ Axios และกำหนด Base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001', // ชี้ไปที่ Go Fiber ของเรา
  timeout: 10000, // ถ้ารอนานเกิน 10 วิให้ตัดจบ
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor: ก่อนที่ Request จะพุ่งออกไปหา Backend ให้ทำสิ่งนี้ก่อน
api.interceptors.request.use(
  (config) => {
    // ไปดึง Token ที่เก็บไว้ตอน Login มา
    const token = localStorage.getItem('token');
    
    // ถ้ามี Token ก็แนบใส่ Header ไปด้วย
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor: เมื่อ Backend ตอบกลับมา ให้ทำสิ่งนี้ก่อนส่งให้ Component
api.interceptors.response.use(
  (response) => {
    // ถ้า Request สำเร็จ (Status 2xx) ก็ปล่อยผ่านปกติ
    return response;
  },
  (error) => {
    // ถ้าเกิด Error จัดการตรงนี้เลย
    if (error.response && error.response.status === 401) {
      // 401 แปลว่า Token หมดอายุ หรือไม่มีสิทธิ์
      console.error('Unauthorized! Token expired or invalid.');
      
      // ลบข้อมูลเก่าทิ้ง
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // บังคับเด้งไปหน้า Login (ถ้าใช้ React Router)
    //   window.location.href = '/login'; 
    }
    
    return Promise.reject(error);
  }
);

export default api;