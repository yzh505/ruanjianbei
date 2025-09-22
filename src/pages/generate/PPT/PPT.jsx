import React, { useState, useRef, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import {
  BookOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import '@icon-park/react/styles/index.css';
import ReactMarkdown from 'react-markdown'; // 用于渲染Markdown
import { message, Upload as AntUpload, Button, Space, Card, Select, Input, List, Empty } from 'antd';
import styles from '../../../scss/generate/PPT/PPT.module.scss'; // 引入 SCSS 模块
import { useNavigate} from 'react-router-dom';
import { FolderPlus, Close} from '@icon-park/react';
import html2canvas from 'html2canvas';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { Extension } from '@tiptap/core';
import {saveTextResource} from '../../../api/courseware'
import {getCourseList} from '../../../api/coursedesign'
import {getKnowledgebaseList}from '../../../api/knowledge'
import { DocmeeUI, CreatorType } from "@docmee/sdk-ui";
import axios from 'axios';
//图标
Modal.setAppElement('#root');
const LessonPlanManager = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');
   const userInfo =JSON.parse(localStorage.getItem('user')) ;
  const stats = {
    total: 128,
    generated: 45,
    inProgress: 12,
    completed: 71
  };
  const [activePage, setActivePage] = useState('creator');
const apiKey = "ak_sKB0RApsv3FsrnjPrN"; // TODO 填写你的API-KEY
// 用户ID，不同uid创建的token数据会相互隔离，主要用于数据隔离
const uid = userInfo.uid;
// 限制 token 最大生成PPT次数
const limit = 14;

const main=async ()=>{
    if (!apiKey) {
    alert("请填写API-KEY");
    return;
  }
  // 创建token（请在调用服务端接口实现）
  const res = await fetch("https://docmee.cn/api/user/createApiToken", {
    method: "POST",
    body: JSON.stringify({
      uid: uid,
      limit: limit,
    }),
    headers: {
      "Api-Key": apiKey,
      "Content-Type": "application/json",
    },
  });

  const json = await res.json();

  const docmeeUI = new DocmeeUI({
    container: "container", // 挂载 iframe 容器元素ID
    page: "creator", // 'dashboard' ppt列表; 'creator' 创建页面; 'customTemplate' 自定义模版; 'editor' 编辑页（需要传pptId字段）
    creatorVersion: "v2",
    token: json.data.token, // token
    creatorData: {
      text: "",
      creatorNow: true,
      type: CreatorType.AI_GEN,
    },
    isMobile: false, // 移动端模式
    padding: "40px 20px 0px",
    background: "#eeefff", // 自定义背景
    mode: "light", // light 亮色模式, dark 暗色模式
    lang: "zh", // 国际化
    onMessage: async (message) => {
      if (message.type === "invalid-token") {
        // 在token失效时触发
        console.log("token 认证错误");
        // 更换新的 token
        // docmeeUI.updateToken(newToken)
      } else if (message.type === "beforeGenerate") {
        const { subtype, fields } = message.data;
         console.log("即将生成ppt大纲", fields);
        if (subtype === "outline") {
          console.log("即将生成ppt大纲", fields);
          return true;
        } else if (subtype === "ppt") {
          // 生成PPT前触发
          console.log("即将生成ppt", fields);
          docmeeUI.sendMessage({
            type: "success",
            content: "继续生成PPT",
          });
          return true;
        }
      } else if (message.type === "beforeCreateCustomTemplate") {
        const { file, totalPptCount } = message.data;
        // 是否允许用户继续制作PPT
        console.log("用户自定义完整模版，PPT文件：", file.name);
        if (totalPptCount < 2) {
          console.log("用户生成积分不足，不允许制作自定义完整模版");
          return false;
        }
        return true;
      } else if (message.type == "pageChange") {
        pageChange(message.data.page);
      } else if (message.type === "beforeDownload") {
        // 自定义下载PPT的文件名称
        const { id, subject ,coverUrl} = message.data;
        const res1 =await fetch('https://open.docmee.cn/api/ppt/downloadPptx',{
          method: "POST",
          body: JSON.stringify({
            "id": id,
            "refresh": false
          }
          ),
          headers: {
            "Api-Key": apiKey,
            "Content-Type": "application/json",
          },
        })
        const json = await res1.json();
        console.log(json.data.fileUrl)
        setFileUrl( json.data.fileUrl)
        setIsSaveModalOpen(true);
        console.log(res.data)
        return `PPT_${subject}.pptx`;
      } else if (message.type == "error") {
        if (message.data.code == 88) {
          // 创建token传了limit参数可以限制使用次数
          alert("您的次数已用完");
        } else {
          alert("发生错误：" + message.data.message);
        }
      }
    },
  });

  document.getElementById("page_creator").addEventListener("click", () => {
    docmeeUI.navigate({ page: "creator" });
  });
  document.getElementById("page_dashboard").addEventListener("click", () => {
    docmeeUI.navigate({ page: "dashboard" });
  });
  document
    .getElementById("page_customTemplate")
    .addEventListener("click", () => {
      docmeeUI.navigate({ page: "customTemplate" });
    });

  function pageChange(page) {
    if (page == "creatorV2") {
      page = "creator";
    }
    let element = document.getElementById("page_" + page);
    if (element) {
      element.parentNode.childNodes.forEach(
        (c) => c.classList && c.classList.remove("selected")
      );
      element.classList.add("selected");
    }
  }
}
  const [fileUrl,setFileUrl] = useState('') 
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFormData, setSaveFormData] = useState({
    course: 'ppt',
    name: '',
    notes: ''
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSaveFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
  const handleSaveSubmit = async () => {
      setIsSaving(true);
      try {
        // 这里添加实际的保存逻辑
        const res =await saveTextResource({
          "text_picture":"https://weizixuan.oss-cn-beijing.aliyuncs.com/a3aedacc-0fbf-48da-b75d-6eb43c3b21b2.png",
          "textType":saveFormData.course,
          "textName": saveFormData.name,
          "textIntroduction":saveFormData.notes,
          "textContent": "",
          "textUrl":fileUrl,
          "status": 0,
          "courseId": setSelectedCourse
        });
        message.success('保存成功')
      } catch (error) {
        message.error('保存失败，请重试！');
      } finally {
        setIsSaving(false);
        setIsSaveModalOpen(false);
      }
  };

useEffect(() => { 
  main();
}, []);
  const [selectedKnowledge, setSelectedKnowledge] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentCourse,setCurrentCourse]=useState(null)
  const [courseOptions,setCourseOptions] = useState([
    { label: '语文', value: 'chinese', desc: '人文素养与阅读写作', createdAt: '2024-06-01' },
    { label: '数学', value: 'math', desc: '逻辑思维与解题能力', createdAt: '2024-05-20' },
    { label: '英语', value: 'english', desc: '听说读写全方位提升', createdAt: '2024-05-15' },
    { label: '物理', value: 'physics', desc: '实验探究与理论结合', createdAt: '2024-04-30' },
  ]);
  const handleCreate = () => {
    message.success(`已选择知识库：${selectedKnowledge || '无'}，课程：${selectedCourse || '无'}，即将创作！`);
    // 这里可以触发实际的创作逻辑
  };
  // 假设知识库数据如下
  const [knowledgeList,setKnowledgeList] = useState([]);
  const [showKnowledgeDropdown, setShowKnowledgeDropdown] = useState(false);

  const selectedKnowledgeObj = knowledgeList.find(k => k.key === selectedKnowledge);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const filteredKnowledgeList = knowledgeList.filter(item =>
    item.knowledgebaseName.includes(knowledgeSearch) || item.knowledgebaseIntroduction.includes(knowledgeSearch)
  );
  const handleSelectKnowledgeModal = (item) => {
    setSelectedKnowledge(item.knowledgebaseId);
    setIsKnowledgeModalOpen(false);
    setKnowledgeSearch('');
  };
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const filteredCourseList = courseOptions.filter(item =>
    item.courseName?.includes(courseSearch)
  );
  const selectedCourseObj = courseOptions.find(c => c.courseId === selectedCourse);
  const handleSelectCourseModal = (item) => {
    setSelectedCourse(item.courseId);
    setIsCourseModalOpen(false);
    setCourseSearch('');
  };
  const getBaseList =async ()=>{
    try{
    const res = await getKnowledgebaseList()
    console.log(res)
    const res1 =await getCourseList()
    console.log(res1)
    setCourseOptions(res1.data.data)
    setKnowledgeList(res.data.data) 
  } catch (error) {
    message.error('保存失败，请重试！');
  } 

  }
useEffect( () => {
  getBaseList();
}, []);
  return (
    <div className={styles.PPT}>
      {/* Header 标题区 */}
      <header className={styles.header}>
        <h1 className={styles.title}>智能PPT生成助手</h1>
        <p className={styles.subtitle}>AI驱动，快速生成高质量演示文稿</p>
      </header>

      {/* 选择区 */}
      {/* Top 数据面板区，可自定义内容 */}
     <div className={styles.dataPanel}>
        <div className={`${styles.dataCard} ${styles.total}`}>
          <div className={styles.cardIcon}>
            <BookOutlined />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.value}>{stats.total}</div>
            <div className={styles.label}>课程总数</div>
          </div>
          <div className={styles.cardTrend}>
            <span className={styles.trendValue}>+12%</span>
            <span className={styles.trendLabel}>较上月</span>
          </div>
        </div>
        <div className={`${styles.dataCard} ${styles.generated}`}>
          <div className={styles.cardIcon}>
            <RocketOutlined />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.value}>{stats.generated}</div>
            <div className={styles.label}>已生成课程</div>
          </div>
          <div className={styles.cardTrend}>
            <span className={styles.trendValue}>+8%</span>
            <span className={styles.trendLabel}>较上月</span>
          </div>
        </div>
        <div className={`${styles.dataCard} ${styles.inProgress}`}>
          <div className={styles.cardIcon}>
            <LoadingOutlined />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.value}>{stats.inProgress}</div>
            <div className={styles.label}>进行中</div>
          </div>
          <div className={styles.cardTrend}>
            <span className={styles.trendValue}>+5%</span>
            <span className={styles.trendLabel}>较上月</span>
          </div>
        </div>
        <div className={`${styles.dataCard} ${styles.completed}`}>
          <div className={styles.cardIcon}>
            <CheckCircleOutlined />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.value}>{stats.completed}</div>
            <div className={styles.label}>已完成</div>
              </div>
          <div className={styles.cardTrend}>
            <span className={styles.trendValue}>+15%</span>
            <span className={styles.trendLabel}>较上月</span>
                              </div>
                              </div>
                            </div>
                            
      {/* 导航区 */}
      <div className={styles.page}>
        <div className={styles.page_navigate} >
          <div
            id="page_creator"
            className={activePage === 'creator' ? styles.active : ''}
            onClick={() => setActivePage('creator')}
          >生成PPT</div>
          <div
            id="page_dashboard"
            className={activePage === 'dashboard' ? styles.active : ''}
            onClick={() => setActivePage('dashboard')}
          >PPT列表</div>
          <div
            id="page_customTemplate"
            className={activePage === 'customTemplate' ? styles.active : ''}
            onClick={() => setActivePage('customTemplate')}
          >自定义模板</div>
        </div>
        
        <div className={styles.selectPanel}>
          {/* 知识库选择弹窗触发 */}
          <div
            className={styles.knowledgeSelectBox}
            onClick={() => setIsKnowledgeModalOpen(true)}
            tabIndex={0}
          >
            {selectedKnowledgeObj ? (
              <>
                <div className={styles.knowledgeTitle}>{selectedKnowledgeObj.knowledgebaseName}</div>
              </>
            ) : (
              <span className={styles.knowledgePlaceholder}>请选择知识库</span>
                              )}
                            </div>
          {/* 课程选择弹窗触发 */}
          <div
            className={styles.knowledgeSelectBox}
            onClick={() => setIsCourseModalOpen(true)}
            tabIndex={0}
          >
            {selectedCourseObj ? (
              <>
                <div className={styles.knowledgeTitle}>{selectedCourseObj.courseName}</div>
              </>
            ) : (
            <span className={styles.knowledgePlaceholder}>请选择课程</span>
            )}
          </div>
          </div>
                  
      {/* 知识库选择弹窗 */}
      {isKnowledgeModalOpen && (
        <div className={styles.knowledgeModalOverlay} onClick={() => setIsKnowledgeModalOpen(false)}>
          <div className={styles.knowledgeModal} onClick={e => e.stopPropagation()}>
            <div className={styles.knowledgeModalHeader}>
              <span>选择知识库</span>
              <button className={styles.knowledgeModalClose} onClick={() => setIsKnowledgeModalOpen(false)}>×</button>
            </div>
            <div className={styles.knowledgeModalSearch}>
              <input
                type="text"
                placeholder="搜索知识库..."
                value={knowledgeSearch}
                onChange={e => setKnowledgeSearch(e.target.value)}
              />
                  </div>
            <div className={styles.knowledgeModalList}>
              {filteredKnowledgeList.length === 0 && <div className={styles.knowledgeModalEmpty}>无匹配知识库</div>}
              {filteredKnowledgeList.map(item => (
                <div
                  key={item.knowledgebaseId}
                  className={styles.knowledgeModalItem + (selectedKnowledge === item.knowledgebaseId ? ' ' + styles.knowledgeModalItemActive : '')}
                  onClick={() => handleSelectKnowledgeModal(item)}
                >
                  <div className={styles.knowledgeTitle}>{item.knowledgebaseName}</div>
                  <div className={styles.knowledgeDesc}>{item.knowledgebaseIntroduction}</div>
                  <div className={styles.knowledgeFiles}>使用者：{item.useNumber}</div>
                </div>
              ))}
                </div>
            </div>
        </div>
      )}
      {/* 课程选择弹窗 */}
      {isCourseModalOpen && (
        <div className={styles.knowledgeModalOverlay} onClick={() => setIsCourseModalOpen(false)}>
          <div className={styles.knowledgeModal} onClick={e => e.stopPropagation()}>
            <div className={styles.knowledgeModalHeader}>
              <span>选择课程</span>
              <button className={styles.knowledgeModalClose} onClick={() => setIsCourseModalOpen(false)}>×</button>
            </div>
            <div className={styles.knowledgeModalSearch}>
              <input
                type="text"
                placeholder="搜索课程..."
                value={courseSearch}
                onChange={e => setCourseSearch(e.target.value)}
              />
          </div>
            <div className={styles.knowledgeModalList}>
              {filteredCourseList.length === 0 && <div className={styles.knowledgeModalEmpty}>无匹配课程</div>}
              {filteredCourseList.map(item => (
                <div
                  key={item.courseId}
                  className={styles.knowledgeModalItem + (selectedCourse === item.courseId ? ' ' + styles.knowledgeModalItemActive : '')}
                  onClick={() => handleSelectCourseModal(item)}
                >
                  <div className={styles.knowledgeTitle}>{item.courseName}</div>
                  <div className={styles.knowledgeDesc}>{item.desc}</div>
                  <div className={styles.knowledgeFiles}>创建时间：{item.startTime?.split('T')[0]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>

      {/* PPT容器区 */}
      <div id="container" className={styles.container}></div>
       {isSaveModalOpen && (
              <div className={styles.saveModalOverlay} onClick={() => setIsSaveModalOpen(false)}>
                <div className={styles.saveModalContent} onClick={e => e.stopPropagation()}>
                  <div className={styles.modalHeader}>
                    <h3>保存PPT</h3>
                    <button 
                      className={styles.closeButton}
                      onClick={() => setIsSaveModalOpen(false)}
                    >
                      <Close theme="outline" size="20" />
                    </button>
                  </div>
      
                  <div className={styles.saveOptions}>
                    <div className={`${styles.option} ${styles.selected}`}>
                      <div className={styles.icon}>
                        <FolderPlus theme="outline" size="24" />
                      </div>
                      <div className={styles.text}>放入PPT库</div>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>PPT名称</label>
                    <input
                      type="text"
                      name="name"
                      value={saveFormData.name}
                      onChange={handleInputChange}
                      placeholder="请输入教案名称"
                    />
                  </div>
      
                  <div className={styles.formGroup}>
                    <label>PPT备注</label>
                    <textarea
                      name="notes"
                      value={saveFormData.notes}
                      onChange={handleInputChange}
                      placeholder="请输入教案备注信息"
                    />
                  </div>
      
                  <div className={styles.buttonGroup}>
                    <button 
                      className={styles.cancelButton}
                      onClick={() => setIsSaveModalOpen(false)}
                    >
                      取消
                    </button>
                    <button
                      className={styles.confirmButton}
                      onClick={handleSaveSubmit}
                      disabled={isSaving || (!saveFormData.name)}
                    >
                      {isSaving ? '保存中...' : '确认保存'}
                    </button>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
};

export default LessonPlanManager;