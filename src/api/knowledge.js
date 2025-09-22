import http from '../utils/http';

export const setupKnowledgeBase = (formData) => 
    http.post(`/Api/base/KnowledageBase/setupKnowledgeBase`,formData); 

export const getKnowledgebaseList = () => 
    http.get(`/Api/base/KnowledageBase/getKnowledgebaseList`); 

export const getDocumentationByKnowledgebaseId = (formData) => 
    http.get(`/Api/base/KnowledageBase/getDocumentationByKnowledgebaseId?knowledgebaseId=`+formData); 

export const getDocumentationById = (formData) => 
    http.get(`/Api/base/KnowledageBase/getDocumentationById?documentationId=`+formData); 

export const UploadDocumentation = (formData,file) => 
    http.post(`/Api/base/KnowledageBase/uploadDocumentation?knowledgebaseId=`+formData,file); 
