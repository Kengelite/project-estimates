import api from "./apiClient"; 

export const login = async (email: string, pwd: string) => {
  const response = await api.post('/api/auth/login', { email, pwd });
  if (response.data && response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};
export const getProfile = async () => {
  const response = await api.get('/api/users/profile');
  return response.data;
};