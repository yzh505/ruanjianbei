import http from '../utils/http';

//优化段落
export const optimizeParagraphs = (formData) => 
    http.post(`/Api/Agent/Resources/optimizeParagraphs`,formData); 
//查找PPT模板
export const setPPTTipic = (formData) => 
    http.post(`/Api/Agent/Resources/setPPTTipic`,formData); 
//生成PPT
export const generatePPT = (formData) => 
    http.post(`/Api/Agent/Resources/generatePPT`,formData); 
//获取PPT
export const getPPTurl = (formData) => 
    http.get(`/Api/Agent/Resources/getPPTurl?sid=`+formData); 
//保存教案/PPT
export const saveTextResource = (formData) => 
    http.post(`/Api/Agent/Resources/savePptResource`,formData); 

//生成流程图
export const generateFlowchart = (formData,courseid) => 
    http.get(`/Api/Agent/PictureResources/generateFlowchart?usermessage=${formData}&courseid=${courseid}`); 

//生成思维导图
export const createMindmap = (formData,courseid,knowledgeId) => 
    http.get(`/Api/Agent/PictureResources/createMindmap?userMessage=${formData}&courseid=${courseid}&knowledgeId=${knowledgeId}`); 

//生成思维导图
export const generateMindmap = (formData,courseid) => 
    http.get(`/Api/Agent/PictureResources/generateMindmap?userMessage=${formData}&courseid=${courseid}`); 

//生成时序图
export const generateTimingDiagram = (formData,courseid) => 
    http.get(`/Api/Agent/PictureResources/generateTimingDiagram?userMessage=${formData}&courseid=${courseid}`); 

// 查询图片题目，支持 query 参数对象
export const get_picture_questions = (params) => {
  // 构建 query string
  const query = Object.entries(params || {})
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return http.get(`/Api/xjk/picture_questions${query ? '?' + query : ''}`);
};
export const add_picture_questions = (formData) => 
    http.post(`/Api/Agent/PictureResources/savePictureResource`,formData); 
export const getPictureSum = (formData) => 
    http.get(`/Api/xjk/picture_questions/getPictureSum?userId=`+formData); 
export const picture_questions_url = (fromData) => 
    http.get(`/Api/xjk/picture_questions/`+fromData); 
export const delete_picture_questions = () => 
    http.delete(`/Api/xjk/picture_questions/{pictureId}`); 
export const update_picture_questions = (formData) => 
    http.put(`/Api/xjk/picture_questions`,formData);
export const picture_questions_batch = (formData) => 
    http.delete(`/Api/xjk/picture_questions/batch`,formData); 

//查询教案列表
export const textResource = (params) => {
     const query = Object.entries(params || {})
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
    return http.get(`/Api/xjk/textResource${query ? '?' + query : ''}`); 
}

//生成视频分析
export const uploadVideo = (params) => {
    const { isKnowledgePoints, isSummary, isKnowledgeGraph, isLabel, file } = params;
    
    // 构建查询参数
    const queryParams = new URLSearchParams({
        isKnowledgePoints: isKnowledgePoints.toString(),
        isSummary: isSummary.toString(),
        isKnowledgeGraph: isKnowledgeGraph.toString(),
        isLabel: isLabel.toString()
    }).toString();
    
    return http.post(`/Api/Agent/videoResources/uploadVideo?${queryParams}`, file);
}; 

//生成题目
export const createQuestionChatForText = (formData) => 
    http.post(`/Api/xjk/ai/createQuestionChatForText`,formData); 

//根据id获取教案/PPT
export const get_textResource = (formData) => 
    http.get(`/Api/xjk/textResource/`+formData); 

//根据id获取教案/PPT
export const getTextSum = (formData) => 
    http.get(`/Api/xjk/textResource/getTextSum?userId=`+formData.userId+'&textType='+formData.textType); 



//根据id获取教案/PPT
export const generateKnowledgeGraph = (formData) => 
    http.get(`/Api/Agent/PictureResources/generateKnowledgeGraph?userMessage=`+formData.userMessage+'&courseid='+formData.courseid+'&knowledgeId='+formData.knowledgeId ); 

//根据id获取教案/PPT
export const getGeneratedResourceList = (formData) => 
    http.get(`/Api/Agent/analyse/getGeneratedResourceList`,formData); 


export const exams_questions = (formData) => 
    http.get(`/Api/xjk/exams_questions?examId=`+formData); 



export const getPrivateResource = (params) => {
     const query = Object.entries(params || {})
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
    return http.get(`/Api/xjk/Search/getPrivateResource${query ? '?' + query : ''}`); 
}

//保存教案/PPT
export const addQuestions = (formData) => 
    http.post(`/Api/xjk/question/addQuestions`,formData); 
