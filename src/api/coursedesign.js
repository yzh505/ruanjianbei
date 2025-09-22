import http from '../utils/http';

export const getDirectory = (formData) => 
    http.post(`/Api/base/TeachingCenter/getDirectory?url=`+formData); 

export const generateTask = (formData) => 
    http.post(`/Api/base/TeachingCenter/generateTask`,formData); 
export const getCourseList = () => 
    http.get(`/Api/base/TeachingCenter/getCourseList`); 
export const getCourseFeature = () => 
    http.get(`/Api/base/TeachingCenter/getCourseFeature`); 

export const generateCourseFeature = () => 
    http.get(`/Api/base/TeachingCenter/generateCourseFeature`); 
export const getCourseRadarmap = (formData) => 
    http.get(`/Api/base/TeachingCenter/getCourseRadarmap?courseId=`+formData); 
export const getRecommendResource = (courseId,weekNum) => 
    http.get(`/Api/base/TeachingCenter/getRecommendResource?courseId=`+courseId+`&weekNum=`+weekNum); 

export const getTask = (formData) => 
    http.get(`/Api/base/TeachingCenter/getTask?courseId=`+formData); 
export const getCourseMessage = (formData) => 
    http.get(`/Api/base/TeachingCenter/getCourseMessage?courseId=`+formData); 

export const getPersonFeature = (courseid,cycleTime) => 
    http.get(`/Api/Agent/analyse/getPersonFeature?courseid=`+courseid+'&cycleTime='+cycleTime); 

export const getResourceRecommend = (courseid,tags) => 
    http.get(`/Api/Agent/analyse/getResourceRecommend?courseid=`+courseid+'&tags='+tags);

export const getCourseData = () => 
    http.get(`/Api/base/TeachingCenter/getCourseData`); 
