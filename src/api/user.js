import http from '../utils/http';

export const login = (formData) => 
    http.put(`/Api/base/User/login?idOrEmail=`+formData.username+`&password=`+formData.password); 

export const register = (formData) => 
    http.post(`/Api/Agent/videoResources/uploadVideo`,formData); 

export const sendVerifyCode = (formData) => 
    http.post(`/Api/Agent/videoResources/uploadVideo`,formData); 

export const uploadFile = (formData) => 
    http.post(`/Api/base/File/uploadFile`,formData); 

export const getUserInfo = () => 
    http.get(`/Api/base/User/getUserInfo`); 

export const updateUser = (formData) => 
    http.put(`/Api/base/User/updateUser`,formData); 

export const textChat = (params) => {
      const { userPrompt, courseId, userIdfile ,file} = params;
    
    // 构建查询参数
    const queryParams = new URLSearchParams({
        userPrompt: userPrompt.toString(),
        courseId: courseId.toString(),
        userIdfile: userIdfile.toString(),
    }).toString();
    return http.get(`/Api/Agent/self-planning/selfPlan?userPrompt=?${queryParams}`,file);
 }






