import http from '../utils/http';

//生成试题
export const newCreateQuestionChatForText = (formData) => 
    http.post(`/Api/xjk/ai/newCreateQuestionChatForText`,formData);
//生成试题
export const createQuestionChatForText = (formData) => 
    http.post(`/Api/xjk/ai/createQuestionChatForText`,formData);  
//ai文档生成题目
export const createQuestionChatForDocumentt = (formData) => 
    http.post(`/Api/xjk/ai/createQuestionChatForDocumentt`,formData); 
//提取图片题目信息
export const get_extractImageText = (formData) => 
    http.get(`/Api/xjk/ai/extractImageText?imagePath=`+formData); 
//提取文档题目信息
export const extractImageText = (formData) => 
    http.post(`/Api/xjk/ai/extractImageText`,formData); 
//AI智能解题 type为"text"时 imageUrlOrText为题目文本，type为"image_url"时 imageUrlOrText为图片url 图片url和文字不能同时上传
export const AiSolving = (formData) => 
    http.get(`/Api/xjk/ai/AiSolving?imageUrlOrText=`+formData.imageUrlOrText+'&type='+formData.type); 
//智能组卷
export const AIRecommendExams = (formData) => 
    http.post(`/Api/xjk/ai/AIRecommendExams`,formData); 

//获取用户的所有题目（分页）
export const question = (params) => {
  // 构建 query string
  const query = Object.entries(params || {})
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return http.get(`/Api/xjk/question${query ? '?' + query : ''}`);
}; 
//添加题目
export const add_question = (formData) => 
    http.post(`/Api/xjk/question`,formData); 

//添加题目
export const exams = (formData) => 
    http.post(`/Api/xjk/exams`,formData); 

//题目数据
export const getQuestionSum = (formData) => 
    http.get(`/Api/xjk/question/getQuestionSum?userId=`+formData); 


//获取用户的所有题目（分页）
export const getExams = (params) => {
  // 构建 query string
  const query = Object.entries(params || {})
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return http.get(`/Api/xjk/exams${query ? '?' + query : ''}`);
}; 

//试卷数据
export const getExamsSum = (formData) => 
    http.get(`/Api/xjk/exams/getExamsSum?userId=`+formData); 

export const recommendQuestion = (formData) => 
    http.get(`/Api/xjk/question/recommendQuestion?tags=`+formData); 

