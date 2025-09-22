import http from '../utils/http';

export const getResourceList = (formData) => 
    http.get('/Api/Agent/analyse/getResourceList?cycleTime='+formData.cycleTime+'&courseid='+formData.courseid); 

export const analyseGeneratedResource = (formData) => 
    http.get('/Api/Agent/analyse/analyseGeneratedResource?cycleTime='+formData.cycleTime+'&courseid'+formData.courseid); 
