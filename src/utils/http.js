// 第二步：封装 Axios 请求 - src/utils/http.js
import axios from 'axios';
import { message } from 'antd';

// 创建实例192.168.50.217
const baseURL = 'http://14.103.151.91:8080';
const instance = axios.create({ 
    baseURL, 
 
  });

// 请求拦截器
instance.interceptors.request.use(config => {
  // 获取本地存储中的 token
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['satoken'] = token;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// 响应拦截器
instance.interceptors.response.use(response => {
  // 根据后端接口规范处理响应
  const tokenHeader = response.headers.get('authorization');
  console.log('Response Headers:',tokenHeader);
  if (tokenHeader) {
    const token = JSON.parse(tokenHeader);
    localStorage.setItem('accessToken', token.accessAuthorization);
    localStorage.setItem('refreshToken', token.refreshAuthorization);
  } else {
   
  }

  if (response.status !== 200) {
    return Promise.reject(new Error(response.data.message || 'Error'));
  }
  return response;
}, error => {
  // 统一错误处理
  if (error.response) {
    switch (error.response.status) {
      case 401:
        message.error('登录已过期，请重新登录');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // 可以在这里添加重定向到登录页的逻辑
        break;
      case 403:
        message.error('没有权限访问');
        break;
      case 500:
        message.error('服务器错误');
        break;
      default:
        message.error('请求失败');
    }
  } else {
    message.error('网络连接异常');
  }
  return Promise.reject(error);
});

export default instance;