import http from '../utils/http';

//生成视频摘要
export const generateVideo = (formData) => 
    http.post(`/Api/Agent/videoResources/uploadVideo`,formData); 

//添加视频资源
export const videoResource = (formData) => 
    http.post(`/Api/Agent/videoResources/saveVideo`,formData); 
//添加视频资源
export const getVideoInformation = (formData) => 
    http.get(`/Api/Agent/videoResources/getVideoInformation?videoId=`+formData); 

//获取视频资源
export const getVideoResource = (formData) => 
    http.get(`/Api/xjk/videoResource?userId=`+formData.userId+`&pageNum=`+formData.pageNum+`&pageSize=`+formData.pageSize+"&videoName="+formData.content); 
//更新视频资源
export const updateVideoResource = (formData) => 
    http.put(`/Api/xjk/videoResource`,formData); 
//删除视频资源
export const deleteVideoResource = (formData) => 
    http.delete(`/Api/xjk/videoResource`,formData); 
//批量删除视频资源
export const deleteBatch = (formData) => 
    http.delete(`/Api/xjk/videoResource/batch`,formData); 

//获取用户视频 总数 、本周、本月、今日
export const getVideoSum = (formData) => 
    http.get(`/Api/xjk/videoResource/getVideoSum?userId=`+formData); 
