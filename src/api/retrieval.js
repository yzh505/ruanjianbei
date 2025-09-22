import http from '../utils/http';

//获取用户的所有题目（分页）
export const getPublicResource = (params) => {
  // 构建 query string
  const query = Object.entries(params || {})
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return http.get(`/Api/xjk/Search/getPublicResource${query ? '?' + query : ''}`);
};  

export const upOrDownExam = (formData) => 
    http.put(`/Api/xjk/exams/upOrDownExam?examId=`+formData); 
export const upOrDownQuestion = (formData) => 
    http.put(`/Api/xjk/question/upOrDownQuestion?questionId=`+formData); 
export const upOrDownTextResource = (formData) => 
    http.put(`/Api/xjk/textResource/upOrDownTextResource?textResourceId=`+formData); 
export const upOrDownPictureResource = (formData) => 
    http.put(`/Api/xjk/picture_questions/upOrDownPictureResource?pictureResourceId=`+formData); 
export const upOrDownVideoResourceId = (formData) => 
    http.put(`/Api/xjk/videoResource/upOrDownVideoResourceId?videoResourceId=`+formData); 

export const copyExam = (params) => {
  // 构建 query string
  const query = Object.entries(params || {})
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return http.get(`/Api/xjk/exams/copyExam${query ? '?' + query : ''}`);
};  
export const copyQuestion = (params) => {
  // 构建 query string
  const query = Object.entries(params || {})
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return http.get(`/Api/xjk/question/copyQuestion${query ? '?' + query : ''}`);
};  
export const copyTextResource = (params) => {
  // 构建 query string
  const query = Object.entries(params || {})
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return http.get(`/Api/xjk/textResource/copyTextResource${query ? '?' + query : ''}`);
};  
export const copyPictureResource = (params) => {
  // 构建 query string
  const query = Object.entries(params || {})
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return http.get(`/Api/xjk/picture_questions/copyPictureResource${query ? '?' + query : ''}`);
};  
export const copyVideoResource = (params) => {
  // 构建 query string
  const query = Object.entries(params || {})
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return http.get(`/Api/xjk/videoResource/copyVideoResource${query ? '?' + query : ''}`);
};  