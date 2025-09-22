import React, { useState, useEffect } from 'react';
import { Card, Input, Select, Button, Space, Table, Tag, Modal, message, Form, DatePicker, AutoComplete, Pagination } from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  CloudSyncOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileUnknownOutlined
} from '@ant-design/icons';
import styles from '../../scss/agentManage/retrieval.module.scss';
import { getPublicResource,upOrDownExam,upOrDownQuestion,upOrDownTextResource,upOrDownPictureResource,upOrDownVideoResourceId ,copyExam,copyQuestion,copyTextResource,copyPictureResource,copyVideoResource} from '../../api/retrieval';
import {textResource,get_picture_questions,exams_questions,getPrivateResource} from '../../api/courseware';
import {getVideoResource} from '../../api/video'
import { question,getExams } from '../../api/exercise';
import ReactMarkdown from 'react-markdown';
import MindMap from '../components/mindMap';
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Retrieval = () => {
  const [form] = Form.useForm();
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedUploadId, setSelectedUploadId] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1.2);
  const [content, setContent] = useState( [
      {
          "entity1": "基因工程",
          "ship": "基于",
          "entity2": "生物化学"
      },
      {
          "entity1": "基因工程",
          "ship": "应用领域",
          "entity2": "创造符合人类需要的产品"
      },
      {
          "entity1": "基因工程",
          "ship": "应用领域",
          "entity2": "解决常规方法不能解决的问题"
      },
      {
          "entity1": "基因工程",
          "ship": "基本操作程序",
          "entity2": "通过不同方法得到目的基因"
      },
      {
          "entity1": "基因工程",
          "ship": "基本操作程序",
          "entity2": "将目的基因与基因表达所需的多种元件组装构成表达载体"
      },
      {
          "entity1": "基因工程",
          "ship": "基本操作程序",
          "entity2": "将表达载体导入受体细胞"
      },
      {
          "entity1": "基因工程",
          "ship": "相关技术",
          "entity2": "蛋白质工程"
      },
      {
          "entity1": "蛋白质工程",
          "ship": "产生背景",
          "entity2": "基因工程只能生产自然界已存在的蛋白质，不一定完全符合人类生产和生活的需要"
      },
      {
          "entity1": "蛋白质工程",
          "ship": "技术手段",
          "entity2": "基因修饰"
    },
  ]);
  const [videoData, setVideoData] = useState(null);
  const mockData = [
    {
      id: 1,
      name: '高中数学教材.pdf',
      type: 'pdf',
      img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
      desc: '适用于高中数学教学的教材资源，内容丰富，讲解细致。',
      category: '教材',
      subject: '数学',
      grade: '高中',
      uploadTime: '2024-03-15 10:30',
      uploader: '张老师',
      tags: ['教材', '必修', '数学'],
    },
    {
      id: 2,
      name: '物理实验指导.docx',
      type: 'word',
      img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
      desc: '高中物理实验指导，包含实验步骤与注意事项。',
      category: '实验指导',
      subject: '物理',
      grade: '高中',
      uploadTime: '2024-03-14 15:20',
      uploader: '李老师',
      tags: ['实验', '物理', '指导'],
    },
    {
      id: 3,
      name: '英语听力材料.mp3',
      type: 'audio',
      img: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80',
      desc: '初中英语听力训练材料，提升听力水平。',
      category: '音频',
      subject: '英语',
      grade: '初中',
      uploadTime: '2024-03-13 09:15',
      uploader: '王老师',
      tags: ['听力', '英语', '音频'],
    },
    {
      id: 4,
      name: '化学实验视频.mp4',
      type: 'video',
      img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
      desc: '高中化学实验演示视频，直观展示实验过程。',
      category: '视频',
      subject: '化学',
      grade: '高中',
      uploadTime: '2024-03-12 14:40',
      uploader: '赵老师',
      tags: ['实验', '化学', '视频'],
    },
    {
      id: 5,
      name: '生物课件.pptx',
      type: 'ppt',
      img: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3c8b?auto=format&fit=crop&w=400&q=80',
      desc: '高中生物课件，内容涵盖细胞结构与功能。',
      category: '课件',
      subject: '生物',
      grade: '高中',
      uploadTime: '2024-03-11 11:25',
      uploader: '孙老师',
      tags: ['课件', '生物', 'PPT'],
    },
    {
      id: 6,
      name: '地理地图资源.jpg',
      type: 'image',
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      desc: '初中地理地图高清图片，适合课堂展示。',
      category: '图片',
      subject: '地理',
      grade: '初中',
      uploadTime: '2024-03-10 10:00',
      uploader: '周老师',
      tags: ['地理', '地图', '图片'],
    },
    {
      id: 7,
      name: '历史试题.zip',
      type: 'zip',
      img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
      desc: '高中历史试题打包下载，含答案解析。',
      category: '试题',
      subject: '历史',
      grade: '高中',
      uploadTime: '2024-03-09 09:30',
      uploader: '钱老师',
      tags: ['历史', '试题', '打包'],
    },
    {
      id: 8,
      name: '政治教案.docx',
      type: 'word',
      img: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3c8b?auto=format&fit=crop&w=400&q=80',
      desc: '高中政治教案，系统梳理知识点。',
      category: '教案',
      subject: '政治',
      grade: '高中',
      uploadTime: '2024-03-08 08:20',
      uploader: '吴老师',
      tags: ['政治', '教案', '知识点'],
    },
  ];
  const [searchValue, setSearchValue] = useState('');
  const [searchOptions, setSearchOptions] = useState([
    { value: '数学', label: '数学' },
    { value: '物理', label: '物理' },
    { value: '英语', label: '英语' },
    { value: '化学', label: '化学' },
    { value: '生物', label: '生物' },
    { value: '地理', label: '地理' },
    { value: '历史', label: '历史' },
    { value: '政治', label: '政治' },
    { value: '课件', label: '课件' },
    { value: '实验', label: '实验' },
    { value: 'PPT', label: 'PPT' },
    { value: '教材', label: '教材' },
    { value: '试题', label: '试题' },
    { value: '教案', label: '教案' },
    { value: '图片', label: '图片' },
    { value: '音频', label: '音频' },
    { value: '视频', label: '视频' },
    { value: '压缩包', label: '压缩包' },
  ]);
  const userInfo =JSON.parse(localStorage.getItem('user')) ;
  const [category, setCategory] = useState('教案');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [tag1, setTag] = useState('');
  const [filteredData, setFilteredData] = useState(mockData);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [pagedData,setPagedData] = useState([]);
  const [putData,setPutData] = useState([]);
  const handleSearch = (value) => {
    setSearchValue(value);
    let result = mockData.filter(item =>
      item.name.includes(value) ||
      item.desc.includes(value) ||
      item.tags.some(tag => tag.includes(value))
    );
    if (category) result = result.filter(item => item.category === category);
    if (subject) result = result.filter(item => item.subject === subject);
    if (grade) result = result.filter(item => item.grade === grade);
    setFilteredData(result);
  };

  const handleCategoryChange = (value) => {
    if(value===category) {
      setCategory('');
      value = '';
    }
    else
    setCategory(value);
    getBaseList(value)
    setCurrentPage(1);
  };  

  const getResource = async () => {
     setUploadModalVisible(true)
     let type ='';
     if(category=='教案'|| category=='ppt'){
       const res = await textResource({
        userId: parseInt(userInfo.uid),
        pageNum:1,
        pageSize:10,
        textType:category=='教案'?'teachingplan':'ppt',
      });
      setPutData(res.data.data);
     }else if(category=='题目'){
      const res =await question({
        creatorId: parseInt(userInfo.uid),
        pageNum:1,
        pageSize:10,
      });
      setPutData(res.data.data);
     }else if(category=='试卷'){
      const res =await getExams({
        userId: parseInt(userInfo.uid),
        pageNum:1,
        pageSize:10,
      });
      setPutData(res.data.data);
     }else if(category=='图片'){
      const res =await get_picture_questions({
        userId: parseInt(userInfo.uid),
        pageNum:1,
        pageSize:10,
      });
      setPutData(res.data.data);
     }else if(category=='视频'){
      const res =await getVideoResource({
        userId: parseInt(userInfo.uid),
        pageNum:1,
        pageSize:10,
        content:''
      });
      setPutData(res.data.data);
     }
    const res1= await getPrivateResource({
      searchUserId: parseInt(userInfo.uid),
      pageNum:1,
      pageSize:20,
      searchKey:searchValue,
      resourceType:category,
      resourceViews:0
    });
    setPutData(res1.data.data);
    try{
    }catch (error) {

    }
  }
  const uploadData =async ()=>{
    setUploadModalVisible(false)
    try{
      let res;
      if(category=='教案'|| category=='ppt'){
        res = await upOrDownTextResource(selectedUploadId);
      }else if(category=='题目'){
        res =await upOrDownQuestion(selectedUploadId);
      }else if(category=='试卷'){
        res =await upOrDownExam(selectedUploadId);
      }else if(category=='图片'){
        res =await upOrDownPictureResource(selectedUploadId);
      }else if(category=='视频'){
        res =await upOrDownVideoResourceId(selectedUploadId);
      }
      if(res.status === 200) {
       getBaseList(category);
      }
      
    }catch (error) {
      message.error('上传失败，请重试！');
    }
  }

  const getBaseList =async (value)=>{
    try {
      const res = await getPublicResource({
        searchUserId:userInfo.uid,
        searchKey:searchValue===''?'':searchValue,
        resourceType:value,
        resourceViews:0,
        pageNum:currentPage,
        pageSize:8
      });
      setPagedData(res.data.data);
      
    } catch (error) {
      console.error('获取资源列表出错：', error);
      message.error('获取资源列表出错');
    }
  }

  const PublicData =async ()=>{
    try{
      let res;
      if(category=='教案'|| category=='ppt'){
        res = await copyTextResource({
          userId: parseInt(userInfo.uid),
          textResourceId:detailItem.textId,
           courseId:0
        });
      }else if(category=='题目'){
        res =await copyQuestion({
          userId: parseInt(userInfo.uid),
          questionId:detailItem.id,
           courseId:0
        });
      }else if(category=='试卷'){
        res =await copyExam({
          userId: parseInt(userInfo.uid),
          examId:detailItem.id,
          courseId:0
        });
      }else if(category=='图片'){
        res =await copyPictureResource({
          userId: parseInt(userInfo.uid),
          PictureResourceId:detailItem.pictureId,
          courseId:0
        });
      }else if(category=='视频'){
        res =await copyVideoResource({
          userId: parseInt(userInfo.uid),
          videoResourceId:detailItem.videoId,
        });
      }
      if(res.status === 200) {
        setDetailModalVisible(false);
      }
    }catch (error) {
      message.error('上传失败，请重试！');
    }
  }
  const getEaxmsQuestion = async(item)=>{
    console.log(item.id)
    try{
      const res = await exams_questions(item.id);
      console.log(res.data)
    }catch (error) {
    }
  }
   const getGraphContent = () => {
    if (detailItem?.parsedKnowledgeGraph && detailItem.parsedKnowledgeGraph.length > 0) {
      return detailItem.parsedKnowledgeGraph.map(item => ({
        entity1: item.startEntity,
        ship: item.relationship,
        entity2: item.endEntity
      }));
    }
    return content;
  };
useEffect( () => {
  getBaseList(category);
}, []);
useEffect( () => {
  getBaseList(category);
}, [currentPage]);

  return (
    <div className={styles.retrievalContainer}>
      <div style={{marginBottom: 18, textAlign: 'center'}}>
        <div style={{fontSize: 33, fontWeight: 600, color: '#1890ff', marginBottom: 6}}>资源智能检索</div>
        <div style={{fontSize: 15, color: '#555'}}>支持多条件筛选、智能联想、快速定位所需教学资源。可按分类、学科、年级等组合搜索，助力高效教学。</div>
      </div>
      <div className={styles.top}>
        {/* 搜索框单独一行居中 */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 10}}>
          <span style={{marginRight: 12, fontWeight: 500}}>搜索：</span>
          <AutoComplete
            options={searchOptions}
            style={{ width: 550 }}
            value={searchValue}
            onChange={handleSearch}
            placeholder="请输入关键词/标签/描述"
            allowClear
            size="large"
            className={styles.searchInput}
          >
            <Input.Search
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
            />
          </AutoComplete>
        </div>
        {/* 资源类型选择区块 */}
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 10}}>
          <span style={{minWidth: 80, fontWeight: 500}}>资源类型：</span>
          <Select
            value={category || undefined}
            onChange={handleCategoryChange}
            placeholder="选择类型"
            style={{width: 120, marginRight: 16}}
            allowClear
            size="large"
          >
            {['题目','试卷','教案','ppt','图片','视频'].map(type => (
              <Select.Option key={type} value={type}>{type}</Select.Option>
            ))}
          </Select>
          <Button icon={<PlusOutlined />} size="large" onClick={() =>getResource()} className={styles.addBut}>
            上传资源
          </Button>
        </div>
       
      </div>
      <div className={styles.result} style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginTop: 24}}>
        {pagedData?.map(item => (
          <>
            {category=='教案'&&<div key={item.id} hoverable className={styles.itemCard} style={{borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(24,144,255,0.08)', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', cursor:'pointer'}}
              onClick={() => { setDetailItem(item); setDetailModalVisible(true); }}>
             <div style={{padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                <div style={{fontWeight: 600, fontSize: 16, color: '#262626', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.textName}</div>
                <div style={{color: '#888', fontSize: 13, marginBottom: 6, height: 32, overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.textIntroduction}</div>
                <div className={styles.tags}>
                  <Tag color="blue" className={styles.tag}>{item.textType}</Tag>
                  {item.tags?.split(',')?.map(tag => <Tag key={tag} color="cyan" className={styles.tag}>{tag}</Tag>)}
                </div>
                <div style={{color: '#666', fontSize: 12, marginBottom: 2}}>上传：{item.createTime?.split("T")[0]}</div>
              </div>
            </div>}
            {category=='试卷'&&<div key={item.id} hoverable className={styles.itemCard} style={{borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(24,144,255,0.08)', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', cursor:'pointer'}}
              onClick={() => { setDetailItem(item); setDetailModalVisible(true); getEaxmsQuestion(item) }}>
              <div style={{padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                    <div style={{fontWeight: 600, fontSize: 16, color: '#262626', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.title}</div>
                    <div style={{color: '#888', fontSize: 13, marginBottom: 6, height: 32, overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.description}</div>
                    <div style={{color: '#888', fontSize: 13, marginBottom: 6, height: 32, overflow: 'hidden', textOverflow: 'ellipsis'}}>分数：{item.grade}</div>
                    <div className={styles.tags}>
                      <Tag color="blue" className={styles.tag}>{item.subject}</Tag>
                      {item.tags?.split(',')?.map(tag => <Tag key={tag} color="cyan" className={styles.tag}>{tag}</Tag>)}
                    </div>
                    <div style={{color: '#666', fontSize: 12, marginBottom: 2}}>上传：{item.createdAt?.split("T")[0]}</div>
                  </div>
            </div>}
            {category=='题目'&&
            <div key={item.id} hoverable className={styles.itemCard} style={{borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(24,144,255,0.08)', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', cursor:'pointer'}}
              onClick={() => { setDetailItem(item); setDetailModalVisible(true); }}>
             <div style={{padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                <div style={{fontWeight: 600, fontSize: 16, color: '#262626', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.questionName}</div>
                <div style={{color: '#1890ff', fontSize: 13, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis'}}>题目：{item.question}</div>
                <div style={{color: 'red', fontSize: 13, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis'}}>答案：{item.answer}</div>
                <div>
                  <Tag className={styles.tag} color="blue">{item.difficulty==3?'中等':item.difficulty==2?'简单':item.difficulty==1?'极简':item.difficulty==4?'困难':'极难'}</Tag>
                  <Tag className={styles.tag} color="red">{item.type}</Tag>
                </div>
                <div style={{color: '#666', fontSize: 12, marginBottom: 2}}>上传：{item.createdAt?.split("T")[0]}</div>
              </div>
            </div>}
            {category=='图片'&&
            <div key={item.id} hoverable className={styles.itemCard} style={{borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(24,144,255,0.08)', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', cursor:'pointer'}}
              onClick={() => { setDetailItem(item); setDetailModalVisible(true); }}>
              <div style={{padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                <img src={item.pictureUrl}></img>
                <div style={{fontWeight: 600, fontSize: 16, color: '#262626', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.pictureName}</div>
                <div style={{color: '#888', fontSize: 13, marginBottom: 6, height: 32, overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.pictureIntroduction}</div>
                <div className={styles.tags}>
                  <Tag color="blue" className={styles.tag}>{item.pictureType}</Tag>
                  {item.tags?.split(',')?.map(tag => <Tag key={tag} color="cyan" className={styles.tag}>{tag}</Tag>)}
                </div>
                <div style={{color: '#666', fontSize: 12, marginBottom: 2}}>上传：{item.createTime?.split("T")[0]}</div>
              </div>
            </div>}
            {category=='ppt'&&<div key={item.id} hoverable className={styles.itemCard} style={{borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(24,144,255,0.08)', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', cursor:'pointer'}}
              onClick={() => { setDetailItem(item); setDetailModalVisible(true); }}>
             <div style={{padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                <div style={{fontWeight: 600, fontSize: 16, color: '#262626', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.textName}</div>
                <div style={{color: '#888', fontSize: 13, marginBottom: 6, height: 32, overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.textIntroduction}</div>
                <div className={styles.tags}>
                  <Tag color="blue" className={styles.tag}>{item.textType}</Tag>
                  {item.tags?.split(',')?.map(tag => <Tag key={tag} color="cyan" className={styles.tag}>{tag}</Tag>)}
                </div>
                <div style={{color: '#666', fontSize: 12, marginBottom: 2}}>上传：{item.createTime?.split("T")[0]}</div>
              </div>
            </div>}
             {category=='视频'&&<div key={item.id} hoverable className={styles.itemCard} style={{borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(24,144,255,0.08)', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', cursor:'pointer'}}
              onClick={() => { setDetailItem(item); setDetailModalVisible(true); }}>
             <div style={{padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                <div style={{fontWeight: 600, fontSize: 16, color: '#262626', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.videoName}</div>
                <img src={'https://weizixuan.oss-cn-beijing.aliyuncs.com/image/96f1fc65a9e6afb6.png'}></img>
                <div className={styles.tags}>
                  <Tag color="blue" className={styles.tag}>视频</Tag>
                  {item.videoLabel?.split(',')?.map(tag => <Tag key={tag} color="cyan" className={styles.tag}>{tag}</Tag>)}
                </div>
                <div style={{color: '#666', fontSize: 12, marginBottom: 2}}>上传：{item.sendTime?.split("T")[0]}</div>
              </div>
            </div>}
          </>
        ))}
      {/* 资源详情弹窗 */}
      <Modal
        title="资源详情"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={900}
        bodyStyle={{padding: 0, borderRadius: 16, overflow: 'hidden'}}
      >
        {detailItem && (
          <>
            {category === '题目' && (
              <div className={styles.techDetailCard}>
                <div className={styles.techHeader}>
                  <div className={styles.techTitle}>
                    <span className={styles.techIcon}>
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#1890ff"/><path d="M16 8v16M8 16h16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                    </span>
                    {detailItem.questionName || detailItem.textName || detailItem.title || detailItem.pictureName || detailItem.videoName}
                  </div>
                  <div className={styles.techMeta}>
                    <span className={styles.techType}>{detailItem.type}</span>
                    <span className={styles.techSubject}>{detailItem.subject}</span>
                    <span className={styles.techDifficulty}>{detailItem.difficulty === 1 ? '极简' : detailItem.difficulty === 2 ? '简单' : detailItem.difficulty === 3 ? '中等' : detailItem.difficulty === 4 ? '困难' : '极难'}</span>
                    <span className={styles.techDate}>{detailItem.createdAt?.split('T')[0]}</span>
                  </div>
                </div>
                <div className={styles.techBody}>
                  <div className={styles.techQuestion}><b>题干：</b>{detailItem.question}</div>
                  {(detailItem.type === '单选题' || detailItem.type === '多选题') && detailItem.options && detailItem.options.length > 0 && (
                    <div className={styles.techOptions}><b>选项：</b>
                      <ul>
                        {detailItem.options.map((opt, idx) => (
                          <li key={idx} className={styles.techOptionItem}><span className={styles.techOptionIndex}>{String.fromCharCode(65+idx)}.</span>{opt.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className={styles.techAnswer}><b>答案：</b><span>{detailItem.answer}</span></div>
                  {detailItem.analysis && (
                    <div className={styles.techAnalysis}><b>解析：</b>{detailItem.analysis}</div>
                  )}
                </div>
                <div className={styles.techFooter}>
                  <Button type="primary" className={styles.techBtnSmall} style={{color:'#fff'}} onClick={()=>PublicData()}  >使用</Button>
                  <Button 
                    className={styles.techBtnSmall + ' ' + (detailItem.liked ? styles.liked : '')}
                    icon={
                      <svg width="18" viewBox="0 0 24 24" fill={detailItem.liked ? '#ff4d4f' : 'none'} stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6c-1.5-1.3-3.7-1.1-5 0.4l-1.1 1.2-1.1-1.2c-1.3-1.5-3.5-1.7-5-0.4-1.7 1.5-1.9 4.1-0.3 5.7l7.1 7.4 7.1-7.4c1.6-1.6 1.4-4.2-0.3-5.7z"></path></svg>
                    }
                    onClick={() => {
                      setDetailItem({ ...detailItem, liked: !detailItem.liked });
                    }}
                  >
                    点赞
                  </Button>
                </div>
              </div>
            )}
            {category === '试卷' && (
              <div className={styles.techDetailCard}>
                <div className={styles.techHeader}>
                  <div className={styles.techTitle}>
                    <span className={styles.techIcon}>
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#1890ff"/><path d="M16 8v16M8 16h16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                    </span>
                    {detailItem.questionName || detailItem.textName || detailItem.title || detailItem.pictureName || detailItem.videoName}
                  </div>
                  <div className={styles.techMeta}>
                    <span className={styles.techType}>{detailItem.type}</span>
                    <span className={styles.techSubject}>{detailItem.subject}</span>
                    <span className={styles.techDifficulty}>{detailItem.difficulty === 1 ? '极简' : detailItem.difficulty === 2 ? '简单' : detailItem.difficulty === 3 ? '中等' : detailItem.difficulty === 4 ? '困难' : '极难'}</span>
                    <span className={styles.techDate}>{detailItem.createdAt?.split('T')[0]}</span>
                  </div>
                </div>
                <div className={styles.techBody}>
                  <div className={styles.techQuestion}><b>题干：</b>{detailItem.question}</div>
                  {(detailItem.type === '单选题' || detailItem.type === '多选题') && detailItem.options && detailItem.options.length > 0 && (
                    <div className={styles.techOptions}><b>选项：</b>
                      <ul>
                        {detailItem.options.map((opt, idx) => (
                          <li key={idx} className={styles.techOptionItem}><span className={styles.techOptionIndex}>{String.fromCharCode(65+idx)}.</span>{opt.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className={styles.techAnswer}><b>答案：</b><span>{detailItem.answer}</span></div>
                  {detailItem.analysis && (
                    <div className={styles.techAnalysis}><b>解析：</b>{detailItem.analysis}</div>
                  )}
                </div>
                <div className={styles.techFooter}>
                  <Button type="primary" className={styles.techBtnSmall} style={{color:'#fff'}} onClick={()=>PublicData()}  >使用</Button>
                  <Button 
                    className={styles.techBtnSmall + ' ' + (detailItem.liked ? styles.liked : '')}
                    icon={
                      <svg width="18" viewBox="0 0 24 24" fill={detailItem.liked ? '#ff4d4f' : 'none'} stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6c-1.5-1.3-3.7-1.1-5 0.4l-1.1 1.2-1.1-1.2c-1.3-1.5-3.5-1.7-5-0.4-1.7 1.5-1.9 4.1-0.3 5.7l7.1 7.4 7.1-7.4c1.6-1.6 1.4-4.2-0.3-5.7z"></path></svg>
                    }
                    onClick={() => {
                      setDetailItem({ ...detailItem, liked: !detailItem.liked });
                    }}
                  >
                    点赞
                  </Button>
                </div>
              </div>
            )}
            {category === '图片' && (
              <div className={styles.techDetailCard}>
                <div className={styles.techHeader}>
                  <div className={styles.techTitle}>
                    <span className={styles.techIcon}>
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#1890ff"/><path d="M16 8v16M8 16h16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                    </span>
                    {detailItem.pictureName}
                  </div>
                  <div className={styles.techMeta}>
                    <span className={styles.techType}>{detailItem.pictureType}</span>
                    <span className={styles.techDate}>{detailItem.createTime?.split('T')[0]}</span>
                    <span style={{background:'#e3f0ff',color:'#1890ff',borderRadius:6,padding:'2px 10px'}}>浏览量：{detailItem.pictureViews || 0}</span>
                  </div>
                </div>
                <div className={styles.techBody}>
                  <div style={{display:'flex',alignItems:'center',marginBottom:16}}>
                    <div>
                      <div className={styles.techQuestion}><b>简介：</b>{detailItem.pictureIntroduction}</div>
                      {detailItem.tags && (
                        <div style={{marginBottom:10}}>
                          <b>标签：</b>
                          {detailItem.tags.split(',').map(tag => (
                            <span className={styles.techType} style={{marginRight:8}}>{tag.replace('#','').trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <img src={detailItem.pictureUrl} alt={detailItem.pictureName} style={{width: 360, height: 180, objectFit: 'contain', borderRadius: 8, boxShadow: '0 1px 4px #e3f0ff', marginRight: 24}} />
                    
                  </div>
                  {detailItem.pictureContent && (
                    <div className={styles.techAnalysis} style={{marginTop:10,maxHeight:'300px',overflowY:'auto'}}>
                      <b>内容：</b>
                      <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-all',background:'none',margin:0,padding:0}}>{detailItem.pictureContent}</pre>
                    </div>
                  )}
                </div>
                <div className={styles.techFooter}>
                  <Button type="primary" className={styles.techBtnSmall} style={{color:'#fff'}} onClick={()=>PublicData(detailItem)}>使用</Button>
                  <Button
                    className={styles.techBtnSmall + ' ' + (detailItem.liked ? styles.liked : '')}
                    icon={
                      <svg width="18" viewBox="0 0 24 24" fill={detailItem.liked ? '#ff4d4f' : 'none'} stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6c-1.5-1.3-3.7-1.1-5 0.4l-1.1 1.2-1.1-1.2c-1.3-1.5-3.5-1.7-5-0.4-1.7 1.5-1.9 4.1-0.3 5.7l7.1 7.4 7.1-7.4c1.6-1.6 1.4-4.2-0.3-5.7z"></path></svg>
                    }
                    onClick={() => {
                      setDetailItem({ ...detailItem, liked: !detailItem.liked });
                    }}
                  >
                    点赞
                  </Button>
                </div>
              </div>
            )}
            {category === '教案' && (
              <div className={styles.techDetailCard}>
                <div className={styles.techHeader}>
                  <div className={styles.techTitle}>
                    <span className={styles.techIcon}>
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#1890ff"/><path d="M16 8v16M8 16h16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                    </span>
                    {detailItem.textName}
                  </div>
                  <div className={styles.techMeta}>
                    <span className={styles.techType}>{detailItem.textType === 'teachingplan' ? '教案' : detailItem.textType}</span>
                    <span className={styles.techDate}>{detailItem.createTime?.split('T')[0]}</span>
                  </div>
                </div>
                <div className={styles.techBody}>
                  <div className={styles.techQuestion}><b>简介：</b>{detailItem.textIntroduction}</div>
                  {detailItem.tags && (
                    <div style={{marginBottom:12}}>
                      <b>标签：</b>
                      {detailItem.tags.split(',').map(tag => (
                        <span key={tag} className={styles.techType} style={{marginRight:8}}>{tag}</span>
                      ))}
                    </div>
                  )}
                  {detailItem.textContent && (
                    <div className={styles.techAnalysis} style={{marginTop:16}}>
                      <b>详细内容：</b>
                      <div style={{marginTop:8}}>
                        <div style={{maxHeight:320,overflowY:'auto',background:'#fff',borderRadius:8,padding:'12px 16px',boxShadow:'0 1px 4px #e3f0ff'}}>
                          <ReactMarkdown>{detailItem.textContent}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.techFooter}>
                  <Button type="primary" className={styles.techBtnSmall} style={{color:'#fff'}} onClick={()=>PublicData(detailItem)}  >使用</Button>
                  <Button 
                    className={styles.techBtnSmall + ' ' + (detailItem.liked ? styles.liked : '')}
                    icon={
                      <svg width="18" viewBox="0 0 24 24" fill={detailItem.liked ? '#ff4d4f' : 'none'} stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6c-1.5-1.3-3.7-1.1-5 0.4l-1.1 1.2-1.1-1.2c-1.3-1.5-3.5-1.7-5-0.4-1.7 1.5-1.9 4.1-0.3 5.7l7.1 7.4 7.1-7.4c1.6-1.6 1.4-4.2-0.3-5.7z"></path></svg>
                    }
                    onClick={() => {
                      setDetailItem({ ...detailItem, liked: !detailItem.liked });
                    }}
                  >
                    点赞
                  </Button>
                </div>
              </div>
            )}
            {category === 'ppt' && (
              <div className={styles.techDetailCard}>
                <div className={styles.techHeader}>
                  <div className={styles.techTitle}>
                    <span className={styles.techIcon}>
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#1890ff"/>
                        <path d="M16 8v16M8 16h16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </span>
                    {detailItem.textName}
                  </div>
                  <div className={styles.techMeta}>
                    <span className={styles.techType}>{detailItem.textType === 'teachingplan' ? '教案' : detailItem.textType}</span>
                    <span className={styles.techDate}>{detailItem.createTime?.split('T')[0]}</span>
                    <span className={styles.techViews}>浏览量：{detailItem.textViews || 0}</span>
                  </div>
                </div>
                <div className={styles.techBody}>
                  <div className={styles.techQuestion}><b>简介：</b>{detailItem.textIntroduction}</div>
                  {detailItem.tags && (
                    <div style={{marginBottom:12}}>
                      <b>标签：</b>
                      {detailItem.tags.split(',').map(tag => (
                        <span key={tag} className={styles.techType} style={{marginRight:8}}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <div style={{marginBottom:12}} >
                    <iframe
                       src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(detailItem.textUrl)}`}
                       title="PPT预览"
                       className={styles.iframe}
                       frameBorder="0"
                       allowFullScreen
                    />
                  </div>
                  <div style={{marginTop:16, display:'flex', gap:16}}>
                    <a href={detailItem.textUrl} target="_blank" rel="noopener noreferrer">
                      <Button type="primary" className={styles.techBtnSmall} style={{color:'#fff'}}>在线预览</Button>
                    </a>
                    <a href={detailItem.textUrl} download>
                      <Button className={styles.techBtnSmall} style={{color:'#1890ff', background:'#e3f0ff'}}>下载PPT</Button>
                    </a>
                  </div>
                </div>
                <div className={styles.techFooter}>
                  <Button type="primary" className={styles.techBtnSmall} style={{color:'#fff'}} onClick={()=>PublicData(detailItem)}>使用</Button>
                  <Button
                    className={styles.techBtnSmall + ' ' + (detailItem.liked ? styles.liked : '')}
                    icon={
                      <svg width="18" viewBox="0 0 24 24" fill={detailItem.liked ? '#ff4d4f' : 'none'} stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6c-1.5-1.3-3.7-1.1-5 0.4l-1.1 1.2-1.1-1.2c-1.3-1.5-3.5-1.7-5-0.4-1.7 1.5-1.9 4.1-0.3 5.7l7.1 7.4 7.1-7.4c1.6-1.6 1.4-4.2-0.3-5.7z"></path></svg>
                    }
                    onClick={() => {
                      setDetailItem({ ...detailItem, liked: !detailItem.liked });
                    }}
                  >
                    点赞
                  </Button>
                </div>
              </div>
            )}
            {category === '视频' && (
              <div className={styles.techDetailCard}>
                <div className={styles.techHeader}>
                  <div className={styles.techTitle}>
                    <span className={styles.techIcon}>
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#1890ff"/><path d="M16 8v16M8 16h16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                    </span>
                    {detailItem.videoName || detailItem.title || detailItem.videoLabel}
                  </div>
                  <div className={styles.techMeta}>
                    <span className={styles.techType}>视频</span>
                    <span className={styles.techDate}>{detailItem.sendTime?.split('T')[0]}</span>
                    <span style={{background:'#e3f0ff',color:'#1890ff',borderRadius:6,padding:'2px 10px'}}>浏览量：{detailItem.videoViews || 0}</span>
                  </div>
                </div>
                <div className={styles.techBody}>
                  <div style={{display:'flex',alignItems:'center',marginBottom:16}}>
                    <video src={detailItem.videoUrl} controls style={{width: 320, height: 180, borderRadius: 8, boxShadow: '0 1px 4px #e3f0ff', marginRight: 24}} poster={detailItem.videoPicture} />
                    <div>
                      <div className={styles.techQuestion}><b>简介：</b>{detailItem.videoIntroduction || '暂无简介'}</div>
                      {detailItem.videoLabel && (
                        <div style={{marginBottom:10}}>
                          <b>标签：</b>
                          {detailItem.videoLabel.split(',').map(tag => (
                            <span key={tag} className={styles.techType} style={{marginRight:8}}>{tag.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {detailItem.videoSummary && (
                    <div className={styles.techAnalysis} style={{marginTop:10,maxHeight:230,overflowY:'auto',scrollbarWidth:'thin'}}>
                      <b>视频总结：</b>
                      <div style={{marginTop:8}}>
                        <ReactMarkdown>{detailItem.videoSummary}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                  <div className={styles.techAnalysis} style={{marginTop:10}}>
                    <b>知识图谱：</b>
                    <div style={{marginTop:8,position:'relative',background:'#fff',borderRadius:8,padding:'12px 16px',boxShadow:'0 1px 4px #e3f0ff'}}>
                      <div style={{display:'flex',justifyContent:'flex-end',gap:12,marginBottom:8}}>
                        <Button size="small" style={{borderRadius:20}} onClick={()=>setZoom(z=>Math.min(z+0.2,2))}>+</Button>
                        <Button size="small" style={{borderRadius:20}} onClick={()=>setZoom(z=>Math.max(z-0.2,0.4))}>-</Button>
                        <Button size="small" style={{borderRadius:20}} onClick={()=>setPreviewVisible(true)}>👀</Button>
                      </div>
                      <div style={{width:'100%',height:'320px',overflow:'auto',cursor:'grab',scrollbarWidth:'thin'}}>
                        <MindMap code={getGraphContent()} setCode={setContent} zoom={zoom} draggable={true} />
                      </div>
                      <Modal
                        open={previewVisible}
                        onCancel={()=>setPreviewVisible(false)}
                        footer={null}
                        width={900}
                        bodyStyle={{height:500}}
                        title="知识图谱预览"
                      >
                        <div style={{width:'100%',height:'100%'}}>
                          <div style={{display:'flex',justifyContent:'flex-end',gap:12,marginBottom:8}}>
                            <Button size="small" style={{borderRadius:20}} onClick={()=>setPreviewZoom(z=>Math.min(z+0.2,2))}>放大</Button>
                            <Button size="small" style={{borderRadius:20}} onClick={()=>setPreviewZoom(z=>Math.max(z-0.2,0.4))}>缩小</Button>
                          </div>
                          <div id="mindmap-preview-modal" style={{width:'100%',height:'400px',background:'#fff',borderRadius:8,overflow:'auto',cursor:'grab'}}>
                            <MindMap code={getGraphContent()} setCode={setContent} zoom={previewZoom} draggable={true} />
                          </div>
                        </div>
                      </Modal>
                    </div>
                  </div>
                  {detailItem.videoText && (
                    <div className={styles.techAnalysis} style={{marginTop:10}}>
                      <b>音频文本：</b>
                      <div style={{maxHeight:180,overflowY:'auto',background:'#fff',borderRadius:8,padding:'8px 12px',boxShadow:'0 1px 4px #e3f0ff',scrollbarWidth:'thin'}}>
                        <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-all',background:'none',margin:0,padding:0}}>{detailItem.videoText}</pre>
                      </div>
                    </div>
                  )}
                 
                </div>
                <div className={styles.techFooter}>
                  <Button type="primary" className={styles.techBtnSmall} style={{color:'#fff'}} onClick={()=>PublicData(detailItem)}>使用</Button>
                  <Button
                    className={styles.techBtnSmall + ' ' + (detailItem.liked ? styles.liked : '')}
                    icon={
                      <svg width="18" viewBox="0 0 24 24" fill={detailItem.liked ? '#ff4d4f' : 'none'} stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6c-1.5-1.3-3.7-1.1-5 0.4l-1.1 1.2-1.1-1.2c-1.3-1.5-3.5-1.7-5-0.4-1.7 1.5-1.9 4.1-0.3 5.7l7.1 7.4 7.1-7.4c1.6-1.6 1.4-4.2-0.3-5.7z"></path></svg>
                    }
                    onClick={() => {
                      setDetailItem({ ...detailItem, liked: !detailItem.liked });
                    }}
                  >
                    点赞
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
      </div>
      <div style={{margin: '32px auto', textAlign: 'center',width:'100%',display:'flex',justifyContent:'center'}}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={26}
          onChange={setCurrentPage}
          showSizeChanger={false}
        />
      </div>
      <Modal
        title={null}
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={900}
        bodyStyle={{padding: 0, borderRadius: 16, overflow: 'hidden'}}
      >
        {/* Head 区域 */}
        <div style={{padding: '24px 32px 0 32px', fontSize: 22, fontWeight: 600, color: '#1890ff', textAlign: 'center'}}>请选择资源上传</div>
        {/* Top 搜索框 */}
        <div style={{padding: '24px 32px 0 32px', textAlign: 'center'}}>
          <Input.Search
            placeholder="请输入资源名称/描述/标签"
            allowClear
            size="large"
            style={{width: 400, margin: '0 auto'}}
            // 可绑定弹窗专用搜索逻辑
          />
        </div>
        {/* Content 搜索结果列表，样式与主列表一致 */}
        <div className={styles.result} style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, padding: '32px', maxHeight: 400, overflowY: 'auto'}}>
          {putData?.map(item => {
            // 判断禁用
            const isDisabled = item.status === 1;
            // 教案
            if (category === '教案') {
              return (
                <div
                  key={item.id}
                  className={
                    `${styles.itemCard} ` +
                    (selectedUploadId === item.textId ? styles.active : '') +
                    (isDisabled ? ' ' + styles.disabled : '')
                  }
                  style={{
                    borderRadius: 14,
                    overflow: 'hidden',
                    boxShadow: selectedUploadId === item.textId  ? '0 4px 16px #1890ff33' : '0 2px 8px rgba(24,144,255,0.08)',
                    minHeight: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    cursor: 'pointer',
                    background: isDisabled ? '#f5f5f5' : undefined
                  }}
                  onClick={() => {
                    setSelectedUploadId(item.textId);
                    setIsDisabled(isDisabled);
                  }}
                >
                  <div style={{padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                    <div style={{fontWeight: 600, fontSize: 16, color: '#262626', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.textName}</div>
                    <div style={{color: '#888', fontSize: 13, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.textIntroduction}</div>
                    <div style={{marginBottom: 6}}>
                      <Tag className={styles.tag} color="blue">{item.textType}</Tag>
                      {item.tags?.split(',')?.map(tag => <Tag className={styles.tag} key={tag} color="cyan">{tag}</Tag>)}
                    </div>
                    <div style={{color: '#666', fontSize: 12, marginBottom: 2}}>上传：{item.createTime?.split("T")[0]}</div>
                  </div>
                </div>
              );
            }
            // ppt
            if (category === 'ppt') {
              return (
                <div
                  key={item.id}
                  className={
                    `${styles.itemCard} ` +
                    (selectedUploadId === item.textId? styles.active : '') 
                  }
                  style={{
                    borderRadius: 14,
                    overflow: 'hidden',
                    boxShadow: selectedUploadId === item.textId  ? '0 4px 16px #1890ff33' : '0 2px 8px rgba(24,144,255,0.08)',
                    minHeight: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    background: isDisabled ? '#f5f5f5' : undefined
                  }}
                  onClick={() => {
                    setSelectedUploadId(item.textId);
                    setIsDisabled(isDisabled);
                  }}
                >
                  <div style={{padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                    <div style={{fontWeight: 600, fontSize: 16, color: '#262626', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.textName}</div>
                    <div style={{color: '#888', fontSize: 13, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.textIntroduction}</div>
                    <div style={{marginBottom: 6}}>
                      <Tag className={styles.tag} color="blue">{item.textType}</Tag>
                      {item.tags?.split(',')?.map(tag => <Tag className={styles.tag} key={tag} color="cyan">{tag}</Tag>)}
                    </div>
                    <div style={{color: '#666', fontSize: 12, marginBottom: 2}}>上传：{item.createTime?.split("T")[0]}</div>
                  </div>
                </div>
              );
            }
            // 题目
            if (category === '题目') {
              return (
                <div
                  key={item.id}
                  className={
                    `${styles.itemCard} ` +
                    (selectedUploadId === item.id  ? styles.active : '') 
                  }
                  style={{
                    borderRadius: 14,
                    overflow: 'hidden',
                    boxShadow: selectedUploadId === item.id  ? '0 4px 16px #1890ff33' : '0 2px 8px rgba(24,144,255,0.08)',
                    minHeight: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    background: isDisabled ? '#f5f5f5' : undefined
                  }}
                  onClick={() => {
                     setSelectedUploadId(item.id);
                  }}
                >
                  <div style={{padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                    <div style={{fontWeight: 600, fontSize: 16, color: '#262626', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.questionName}</div>
                    <div style={{color: '#1890ff', fontSize: 13, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis'}}>题目：{item.question}</div>
                    <div style={{color: 'red', fontSize: 13, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis'}}>答案：{item.answer}</div>
                    <div>
                      <Tag className={styles.tag} color="blue">{item.difficulty==3?'中等':item.difficulty==2?'简单':item.difficulty==1?'极简':item.difficulty==4?'困难':'极难'}</Tag>
                      <Tag className={styles.tag} color="red">{item.type}</Tag>
                    </div>
                    <div style={{color: '#666', fontSize: 12, marginBottom: 2}}>上传：{item.createdAt?.split("T")[0]}</div>
                  </div>
                </div>
              );
            }
            if (category === '视频') {
              return (
                <div
                  key={item.id}
                  className={
                    `${styles.itemCard} ` +
                    (selectedUploadId === item.videoId  ? styles.active : '') +
                    (isDisabled ? ' ' + styles.disabled : '')
                  }
                  style={{
                    borderRadius: 14,
                    overflow: 'hidden',
                    boxShadow: selectedUploadId === item.videoId ? '0 4px 16px #1890ff33' : '0 2px 8px rgba(24,144,255,0.08)',
                    minHeight: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    background: isDisabled ? '#f5f5f5' : undefined
                  }}
                  onClick={() => {
                    setSelectedUploadId(item.videoId);
                    setIsDisabled(isDisabled);
                  }}
                >
                  <div style={{padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                <div style={{fontWeight: 600, fontSize: 16, color: '#262626', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.videoName}</div>
                <img src={'https://weizixuan.oss-cn-beijing.aliyuncs.com/image/96f1fc65a9e6afb6.png'}></img>
                <div className={styles.tags}>
                  <Tag color="blue" className={styles.tag}>视频</Tag>
                  {item.videoLabel?.split(',')?.map(tag => <Tag key={tag} color="cyan" className={styles.tag}>{tag}</Tag>)}
                </div>
                <div style={{color: '#666', fontSize: 12, marginBottom: 2}}>上传：{item.sendTime?.split("T")[0]}</div>
              </div>
                </div>
            );
            }
            if (category === '图片') {
              return (
                <div
                  key={item.pictureId}
                  className={
                    `${styles.itemCard} ` +
                    (selectedUploadId === item.pictureId ? styles.active : '') +
                    (isDisabled ? ' ' + styles.disabled : '')
                  }
                  style={{
                    borderRadius: 14,
                    overflow: 'hidden',
                    boxShadow: selectedUploadId === item.pictureId && !isDisabled ? '0 4px 16px #1890ff33' : '0 2px 8px rgba(24,144,255,0.08)',
                    minHeight: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    background: isDisabled ? '#f5f5f5' : undefined
                  }}
                  onClick={() => {
                    setSelectedUploadId(item.pictureId);
                    setIsDisabled(isDisabled);
                  }}
                >
                  <div style={{padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                    <img src={item.pictureUrl}></img>
                    <div style={{fontWeight: 600, fontSize: 16, color: '#262626', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.pictureName}</div>
                    <div style={{color: '#888', fontSize: 13, marginBottom: 6, height: 32, overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.pictureIntroduction}</div>
                    <div className={styles.tags}>
                      <Tag color="blue" className={styles.tag}>{item.pictureType}</Tag>
                      {item.tags?.split(',')?.map(tag => <Tag key={tag} color="cyan" className={styles.tag}>{tag}</Tag>)}
                    </div>
                    <div style={{color: '#666', fontSize: 12, marginBottom: 2}}>上传：{item.createTime?.split("T")[0]}</div>
                  </div>
                </div>
            );
            }
            if (category === '试卷') {
              return (
                <div
                  key={item.id}
                  className={
                    `${styles.itemCard} ` +
                    (selectedUploadId === item.id  ? styles.active : '') 
                  }
                  style={{
                    borderRadius: 14,
                    overflow: 'hidden',
                    boxShadow: selectedUploadId === item.id ? '0 4px 16px #1890ff33' : '0 2px 8px rgba(24,144,255,0.08)',
                    minHeight: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    background: isDisabled ? '#f5f5f5' : undefined
                  }}
                  onClick={() => {
                    setSelectedUploadId(item.id);
                     setIsDisabled(isDisabled);
                  }}
                >
                 <div style={{padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                    <div style={{fontWeight: 600, fontSize: 16, color: '#262626', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.title}</div>
                    <div style={{color: '#888', fontSize: 13, marginBottom: 6, height: 32, overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.description}</div>
                    <div style={{color: '#888', fontSize: 13, marginBottom: 6, height: 32, overflow: 'hidden', textOverflow: 'ellipsis'}}>分数：{item.grade}</div>
                    <div className={styles.tags}>
                      <Tag color="blue" className={styles.tag}>{item.subject}</Tag>
                      {item.tags?.split(',')?.map(tag => <Tag key={tag} color="cyan" className={styles.tag}>{tag}</Tag>)}
                    </div>
                    <div style={{color: '#666', fontSize: 12, marginBottom: 2}}>上传：{item.createdAt?.split("T")[0]}</div>
                  </div>
                </div>
            );
            }
           
            return null;
          })}
        </div>
        {/* Bottom 上传按钮 */}
        <div style={{padding: '24px 32px', textAlign: 'center', background: '#fafcff', borderTop: '1px solid #f0f0f0'}}>
          <Button type="primary" size="large" style={{width: 180, fontSize: 16}} onClick={() => uploadData()}>{isDisabled?'下架':'上传'}资源</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Retrieval;
