import React, { useState ,useEffect,useRef } from 'react';
import Modal from 'react-modal';
import {Back, ArrowLeft,Edit, Close, Book, FolderPlus } from '@icon-park/react';
import '@icon-park/react/styles/index.css';
import styles from '../../../scss/generate/PPT/PPTplayer.module.scss'; // 引入 SCSS 模块
import { useNavigate,useLocation  } from 'react-router-dom';
import { useRequest } from '../../../hooks/useRequest';
import {getPPTurl,saveTextResource} from '../../../api/courseware';
import { message,Button} from 'antd';
Modal.setAppElement('#root');
const PPTplayer = () => {
  const location = useLocation();
  const PPTid =  location.state?.PPTId;
  const { sendRequest, loading, error } = useRequest();
  const navigate = useNavigate(); // 初始化 navigate
  const [color,setColor]=useState('#FCC462')
  const [PPTurl,setPPTurl]=useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveOption, setSaveOption] = useState('course');
  const [isSaving, setIsSaving] = useState(false);
  const [saveFormData, setSaveFormData] = useState({
    course: 'ppt',
    name: '',
    notes: '',
  });
  const userInfo = JSON.parse(localStorage.getItem('user')) || {};
  // 模拟PPT信息
  const [pptInfo] = useState({
    title: '智能教学PPT示例',
    template: '教育培训模板',
    createTime: '2024-03-20',
    pageCount: 24,
    description: '这是一个基于AI生成的智能教学PPT，采用现代化的设计风格，包含了丰富的教学内容和互动元素。适合课堂教学使用。',
    tags: ['教育', '智能', '互动']
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSaveFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSubmit = async () => {
    setIsSaving(true);
    try {
      // 这里添加实际的保存逻辑
      console.log('保存数据:', userInfo.uid);
      const res =await saveTextResource({
        "textType":saveFormData.course,
        "userId": userInfo.uid,
        "textName":saveFormData.name,
        "textIntroduction": saveFormData.notes,
        "textPicture": "https://weizixuan.oss-cn-https://meta-doc.oss-cn-shanghai.aliyuncs.com/ppt/137357/1947546151599345664.pptx?Expires=1753228484&OSSAccessKeyId=LTAI5tAfZYeAw8hN3gDzs7sx&Signature=cbX%2BeByNTm%2BRfNT5fn3i3mqnxl0%3D",
        'textUrl':PPTurl
      });
      setIsSaveModalOpen(false);
      message.success('保存成功')
      fetchData()
    } catch (error) {
      message.error('保存失败，请重试！');
    } finally {
      setIsSaving(false);
    }
  };

    const handleDownload = () => {
      if (PPTurl) {
        const link = document.createElement('a');
        link.href = PPTurl;
        link.download = 'presentation.pptx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success('PPT开始下载');
      } else {
        message.error('PPT链接不可用');
      }
    };
    const onBack=()=>{
      navigate('/PPTModule')
    }
    const handleSave = () => {
      setIsSaveModalOpen(true);
    };

    const fetchData=async ()=>{
      try{
        const PPT = await sendRequest(getPPTurl, PPTid);
        console.log(PPT.data)
        setPPTurl('https://weizixuan.oss-cn-beijing.aliyuncs.com/ppt/1https://meta-doc.oss-cn-shanghai.aliyuncs.com/ppt/137357/1947546151599345664.pptx?Expires=1753228484&OSSAccessKeyId=LTAI5tAfZYeAw8hN3gDzs7sx&Signature=cbX%2BeByNTm%2BRfNT5fn3i3mqnxl0%3D'); 
       }catch{
        message.error('获取PPT失败');
      }
    }
    const fetchCourses=async ()=>{
      
    }

    useEffect(() => {
      fetchData(); 
      fetchCourses();
    }, []); 
  return (
    <div className={styles.pptPlayer}>
     {/* 头部 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button icon={<ArrowLeft />} onClick={onBack} type="link">返回</Button>
          <span className={styles.title}>PPT预览</span>
        </div>
        <div className={styles.headerRight}>
          <Button type="primary" onClick={()=>{setIsSaveModalOpen(true)}}>保存PPT</Button>
          <Button onClick={handleDownload}>下载PPT</Button>
        </div>
        
      </div>

      <div className={styles.content}>
        {/* 左侧内容区 */}
        <div className={styles.leftSection}>
          {/* PPT预览区域 */}
          <div className={styles.previewArea}>
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(PPTurl)}`}
              title="PPT预览"
              className={styles.iframe}
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </div>

        {/* 右侧信息区 */}
        <div className={styles.rightSection}>
          <div className={styles.pptInfo}>
            <h2 className={styles.pptTitle}>{pptInfo.title}</h2>
            
            <div className={styles.infoItem}>
              <label>模板类型</label>
              <span>{pptInfo.template}</span>
            </div>
            
            <div className={styles.infoItem}>
              <label>创建时间</label>
              <span>{pptInfo.createTime}</span>
            </div>
            
            <div className={styles.infoItem}>
              <label>页面数量</label>
              <span>{pptInfo.pageCount} 页</span>
            </div>
            
            <div className={styles.infoItem}>
              <label>标签</label>
              <div className={styles.tags}>
                {pptInfo.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
            
            <div className={styles.description}>
              <label>PPT简介</label>
              <p>{pptInfo.description}</p>
            </div>
          </div>
        </div>
      </div>
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
                placeholder="请输入PPT名称"
              />
            </div>

            <div className={styles.formGroup}>
              <label>PPT备注</label>
              <textarea
                name="notes"
                value={saveFormData.notes}
                onChange={handleInputChange}
                placeholder="请输入PPT备注信息"
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

export default PPTplayer;