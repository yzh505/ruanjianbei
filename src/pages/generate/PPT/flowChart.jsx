import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, message, Select, List, Tooltip, Slider, Modal, Card, Timeline, Statistic, Row, Col } from 'antd';
import mermaid from 'mermaid';
import { Canvg } from 'canvg';
import styles from '../../../scss/generate/PPT/flowChart.module.scss';
import { 
  SaveOutlined, 
  DownloadOutlined, 
  BookOutlined, 
  RocketOutlined, 
  LoadingOutlined, 
  ZoomOutOutlined, 
  ZoomInOutlined, 
  CheckCircleOutlined,
  EditOutlined,
  FileImageOutlined,
  ClockCircleOutlined,
  BorderOutlined,
  AppstoreOutlined,
  BlockOutlined,
  LinkOutlined,
  SaveTwoTone,
  DeleteOutlined,
  CopyOutlined,
  ArrowUpOutlined,
  FireOutlined,
  CaretLeftOutlined,
  CaretRightOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  InfoCircleOutlined,
  BulbOutlined,
  ClearOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  MinusOutlined,
  CompressOutlined
} from '@ant-design/icons';
import {FolderPlus, Close } from '@icon-park/react';
import MindMap from '../../components/mindMap';
import {generateFlowchart,add_picture_questions,generateTimingDiagram,generateKnowledgeGraph,createMindmap} from '../../../api/courseware'
import {uploadFile } from '../../../api/user'
import html2canvas from 'html2canvas';
import {getKnowledgebaseList}from '../../../api/knowledge'
import {getCourseList} from '../../../api/coursedesign'
const { Option } = Select;
const { TextArea } = Input;
const defaultMermaid = `graph TD
A[开始] --> B{条件判断}
B -- 是 --> C[执行操作1]
B -- 否 --> D[执行操作2]
C --> E[结束]
D --> E`;

const chartTypes = [
  { label: '流程图', value: 'Flowchart', template: defaultMermaid },
  { label: '思维导图', value: 'Mindmap', template: 'mindmap\n  root((思维导图))\n    子节点1\n    子节点2' },
  { label: '时序图', value: 'TimingDiagram', template: 'graph TD\nCEO-->CTO\nCEO-->CFO\nCTO-->Dev1\nCTO-->Dev2' },
  { label: '知识图谱', value: 'KnowledgeGraph', template: 'graph TD\nA[知识点A] --> B[知识点B]\nB --> C[知识点C]' },
];

// 添加示例历史数据
const initialHistory = [
  {
    type: 'Flowchart',
    code: 'graph TD\nA[开始] --> B{判断}\nB -- 是 --> C[处理1]\nB -- 否 --> D[处理2]',
    content: '简单的判断流程图',
    time: Date.now() - 1000 * 60 * 30, // 30分钟前
  },
  {
    type: 'Mindmap',
    code: 'mindmap\n  root((思维导图))\n    编程基础\n      数据类型\n      控制流程\n    前端开发\n      HTML\n      CSS\n      JavaScript',
    content: '编程学习思维导图',
    time: Date.now() - 1000 * 60 * 60 * 2, // 2小时前
  },
  {
    type: 'TimingDiagram',
    code: 'graph TD\nCEO[CEO]-->CTO[技术总监]\nCEO-->CFO[财务总监]\nCTO-->Dev1[开发工程师]\nCTO-->Dev2[测试工程师]',
    content: '公司组织架构图',
    time: Date.now() - 1000 * 60 * 60 * 24, // 1天前
  }
];

// 添加示例图表数据
const demoCharts = [
  {
    title: '流程图示例',
    type: 'Flowchart',
    code: `graph TD
    A[开始] --> B{是否登录?}
    B -- 是 --> C[进入主页]
    B -- 否 --> D[跳转登录]
    C --> E[结束]
    D --> B`,
    description: '清晰展示业务流程和决策路径'
  },
  {
    title: '思维导图示例',
    type: 'Mindmap',
    code: `Mindmap
    root((前端开发))
      基础知识
        HTML
        CSS
        JavaScript
      框架技术
        React
        Vue
        Angular
      工程化
        Webpack
        Vite
        Babel`,
    description: '帮助梳理知识体系和项目结构'
  },
  {
    title: '组织架构示例',
    type: 'org',
    code: `graph TD
    CEO[CEO] --> CTO[技术总监]
    CEO --> CFO[财务总监]
    CTO --> Dev1[前端开发]
    CTO --> Dev2[后端开发]
    CTO --> Dev3[测试开发]`,
    description: '展示团队组织结构和职责分配'
  }
];

const FlowChart = () => {
  const [chartType, setChartType] = useState('Flowchart');
  const [mermaidCode, setMermaidCode] = useState('');
  const [svg, setSvg] = useState('');
  const markmapRef = useRef(null);
  const svgRef = useRef(null);
  const [history, setHistory] = useState(initialHistory);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [svgScale, setSvgScale] = useState(1);
  const [inputContent, setInputContent] = useState('请帮我生成添加学习记录的流程图');
  const [currentDemo, setCurrentDemo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
   const [zoom, setZoom] = useState(1);
  const [Mermaid,setMermaid]= useState('1');
  const userInfo = JSON.parse(localStorage.getItem('user')) || {};
  // 渲染 mermaid 流程图
  const renderMermaid = async (code) => {
    try {
      await mermaid.parse(code);
      const { svg } = await mermaid.render('mermaid-svg-' + Date.now(), code);
      setSvg(svg);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  const renderMermaid1 = async (code) => {
    try {
      await mermaid.parse(code);
      const { svg } = await mermaid.render('mermaid-svg-' + Date.now(), code);
      setMermaid(svg);
      return true;
    } catch (e) {
      return false;
    }
  };
  // 首次渲染
  React.useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: false,
      theme: 'default',
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        mirrorActors: true,
        bottomMarginAdj: 1,
        useMaxWidth: true,
      },
      flowchart: {
        curve: 'basis',
        padding: 8,
      },
      themeVariables: {
        primaryColor: '#1890ff',
        primaryTextColor: '#333',
        primaryBorderColor: '#1890ff',
        lineColor: '#1890ff',
        secondaryColor: '#52c41a',
        tertiaryColor: '#722ed1'
      }
    });
  }, []);

  // 添加 markmap 初始化和清理
  React.useEffect(() => {
    if (chartType === 'mindmap' && svgRef.current) {
      // 如果已经有内容，重新渲染
      if (markmapRef.current) {
        markmapRef.current.destroy();
      }
      // 创建新的 SVG 元素
      const svg = document.createElement('svg');
      svg.style.width = '100%';
      svg.style.height = '100%';
      svgRef.current.innerHTML = '';
      svgRef.current.appendChild(svg);
    }
    
    // 清理函数
    return () => {
      if (markmapRef.current) {
        markmapRef.current.destroy();
      }
    };
  }, [chartType]);

  // 自动播放
  React.useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentDemo(prev => (prev + 1) % demoCharts.length);
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // 渲染示例图表
  React.useEffect(() => {
    renderMermaid(demoCharts[currentDemo].code);
  }, [currentDemo]);
  const getGraphContent = (content) => {
    if (content && content.length > 0) {
      console.log(111)
      return content.map(item => ({
        entity1: item.startEntity,
        ship: item.relationship,
        entity2: item.endEntity
      }));
    }
    return content;
  };
  // 生成流程图
  const handleGenerate = async () => {
    if (!inputContent.trim()) {
      message.warning('请输入内容');
      return;
    }
    setIsGenerating(true);
    setCurrentCourse(selectedCourse)
    try {
      if(chartType=='Flowchart'){
        const res = await generateFlowchart(inputContent,selectedCourse);
        setMermaidCode(res.data.data.mermaid);
        await renderMermaid1(res.data.data.mermaid);
      } else if(chartType=='Mindmap'){
        const markdownContent = "# 计算机网络\n## 基本概念\n### 定义\n### 功能\n## 分类\n### 局域网\n### 广域网\n### 城域网\n## 拓扑结构\n### 星型拓扑\n### 环型拓扑\n### 总线型拓扑\n## 传输介质\n### 有线介质\n### 无线介质\n## 网络协议\n### TCP/IP\n### HTTP\n### FTP\n## 网络设备\n### 路由器\n### 交换机\n### 防火墙";
        const res =await createMindmap(inputContent,selectedCourse,selectedKnowledge)
        let cleanData = res.data.data.replace('mermaid\n', '').replace(/```/g, '');
        setMermaidCode(cleanData); 
        await renderMermaid1(cleanData);
      }else if(chartType=='KnowledgeGraph'){
         const res = await generateKnowledgeGraph({
          userMessage:inputContent,
          courseid:selectedCourse,
          knowledgeId:selectedKnowledge
        })
        console.log(res.data)
        setMermaidCode(res.data.data);  
        setMermaid('...')
        let newContent =getGraphContent(res.data.data)
       console.log(newContent)
        setContent(newContent)
      } else {
        const res = await generateTimingDiagram(inputContent,selectedCourse);
        if (res.data && res.data.data) {
         let cleanData = res.data.data.replace('```mermaid\n',"").replace('```','');
         if (!cleanData.trim().startsWith('sequenceDiagram')) {
           cleanData = 'sequenceDiagram\n' + cleanData;
         }
         setMermaidCode(cleanData);
         console.log(cleanData)
         await renderMermaid1(cleanData);
        } else {
          message.error('生成时序图失败，请重试！');
        }
      }
    } catch (error) {
      console.error('Generate error:', error);
      message.error('生成图表失败，请重试！');
    } finally {
      setIsGenerating(false);
    }
  };

  // 导出图片
  const handleExport = async (type) => {
    if (!Mermaid) {
      message.warning('暂无流程图可导出');
      return;
    }

    if (type === 'svg') {
      const blob = new Blob([Mermaid], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flowchart.svg';
      a.click();
      URL.revokeObjectURL(url);
    } else if (type === 'png') {
      let width = 800, height = 600;
      const match = Mermaid.match(/viewBox="([\d\.\s]+)"/);
      if (match) {
        const vb = match[1].split(' ');
        width = parseFloat(vb[2]);
        height = parseFloat(vb[3]);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);
      const v = await Canvg.fromString(ctx, Mermaid);
      await v.render();
      canvas.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'flowchart.png';
        a.click();
        URL.revokeObjectURL(a.href);
      }, 'image/png');
    }
  };

  // 添加图形功能
  const addShape = (type) => {
    let shapeCode = '';
    switch (type) {
      case 'rect':
        shapeCode = '[矩形节点]';
        break;
      case 'circle':
        shapeCode = '((圆形节点))';
        break;
      case 'diamond':
        shapeCode = '{菱形节点}';
        break;
      case 'parallel':
        shapeCode = '&&&parallel&&&';
        break;
    }
    setMermaidCode(prev => prev + '\n' + shapeCode);
  };
const [content, setContent] = useState( );
  // 添加数据面板配置
  const stats = {
    total: 128,
    generated: 45,
    inProgress: 12,
    completed: 71
  };
  function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFormData, setSaveFormData] = useState({
    course: 'teachingplan',
    name: '',
    notes: '',
    picture:''
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSaveFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
  const getPictureUrl=async()=>{
    console.log('getPictureUrl')
    const previewDom = document.querySelector(`.${styles.previewContent}`);
    if (previewDom) {
      const canvas = await html2canvas(previewDom, { backgroundColor: '#fff', useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const file = dataURLtoFile(imgData, `${saveFormData.name || 'chart'}.png`);
      const fileFormData = new FormData();
      fileFormData.append('file', file);
      const result = await uploadFile(fileFormData);
      console.log(result.data.data.fileUrl);
      setImgDataUrl(result.data.data.fileUrl);
    }
  }
  const [imgDataUrl, setImgDataUrl] = useState('');
  const [currentCourse,setCurrentCourse]=useState(null)
  const handleSaveSubmit = async () => {
        setIsSaving(true);
        try {
          const res= await add_picture_questions({
              "pictureName":  saveFormData.name,
              "pictureIntroduction":  saveFormData.notes,
              "pictureType": chartType,
              "pictureUrl": imgDataUrl,
              "pictureContent": mermaidCode,
              "courseId": currentCourse
            })
        } catch (error) {
          message.error('保存失败，请重试！');
        } finally {
          setIsSaving(false);
          setIsSaveModalOpen(false)
        }
  };
  useEffect(() => {
    if (mermaidCode) {
      getPictureUrl();
    }
  }, [mermaidCode]);
  const [selectedKnowledge, setSelectedKnowledge] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(8);
  const [courseOptions,setCourseOptions] = useState([
    { label: '语文', value: 'chinese', desc: '人文素养与阅读写作', createdAt: '2024-06-01' },
    { label: '数学', value: 'math', desc: '逻辑思维与解题能力', createdAt: '2024-05-20' },
    { label: '英语', value: 'english', desc: '听说读写全方位提升', createdAt: '2024-05-15' },
    { label: '物理', value: 'physics', desc: '实验探究与理论结合', createdAt: '2024-04-30' },
  ]);
  // 假设知识库数据如下
   const [knowledgeList,setKnowledgeList] = useState([]);
  const selectedKnowledgeObj = knowledgeList.find(k => k.knowledgebaseId === selectedKnowledge);
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

const [scale, setScale] = useState(chartType === 'mindmap' ? 1.3 : 1);
const previewRef = useRef();
const [centered, setCentered] = useState(true);
const [translate, setTranslate] = useState({ x: 0, y: 0 });
const [dragging, setDragging] = useState(false);
const [dragStart, setDragStart] = useState(null); // {mouseX, mouseY, startX, startY}

// 计算内容居中
const getCenterTransform = () => {
  if (!previewRef.current) return { x: 0, y: 0 };
  const container = previewRef.current;
  const content = container.querySelector('svg, #markMap');
  if (content) {
    const cRect = container.getBoundingClientRect();
    const gRect = content.getBoundingClientRect();
    const contentW = content.offsetWidth || gRect.width;
    const contentH = content.offsetHeight || gRect.height;
    const offsetX = (cRect.width - contentW * scale) / 2;
    const offsetY = (cRect.height - contentH * scale) / 2;
    return { x: offsetX, y: offsetY };
  }
  return { x: 0, y: 0 };
};

const handleZoomIn = () => { setScale(s => Math.min(s + 0.1, 3)); setCentered(true); };
const handleZoomOut = () => { setScale(s => Math.max(s - 0.1, 0.3)); setCentered(true); };
const handleCenter = () => { setCentered(true); setTranslate({ x: 0, y: 0 }); };

useEffect(() => { setCentered(true); setTranslate({ x: 0, y: 0 }); }, [chartType, Mermaid, mermaidCode]);

// 拖拽事件
const handleMouseDown = (e) => {
  e.preventDefault();
  setDragging(true);
  setDragStart({
    mouseX: e.clientX,
    mouseY: e.clientY,
    startX: translate.x,
    startY: translate.y
  });
  setCentered(false);
};
const handleMouseMove = (e) => {
  if (!dragging || !dragStart) return;
  const dx = (e.clientX - dragStart.mouseX) / scale;
  const dy = (e.clientY - dragStart.mouseY) / scale;
  setTranslate({
    x: dragStart.startX + dx,
    y: dragStart.startY + dy
  });
};
const handleMouseUp = () => setDragging(false);
useEffect(() => {
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
}, [dragging, dragStart, scale]);
  return (
    <div className={styles.flowChartContainer}>
        <div className={styles.title}>
          <h1>智能流程图生成助手</h1>
        </div>
       <hr className={styles.divider} />
      
      {/* 数据面板 */}
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

      <div className={styles.mainContent}>
        {/* 功能演示模块 */}
        <div className={styles.demoSection}>
          <Card
            title={
              <div className={styles.demoTitle}>
                <span>功能演示</span>
                <div className={styles.demoControls}>
                  <Button 
                    type="text" 
                    icon={<CaretLeftOutlined />}
                    onClick={() => setCurrentDemo(prev => (prev - 1 + demoCharts.length) % demoCharts.length)}
                  />
                  <Button
                    type="text"
                    icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={() => setIsPlaying(!isPlaying)}
                  />
                  <Button 
                    type="text" 
                    icon={<CaretRightOutlined />}
                    onClick={() => setCurrentDemo(prev => (prev + 1) % demoCharts.length)}
                  />
                </div>
              </div>
            }
          >
            <div className={styles.demoContent}>
              <div className={styles.demoChart}>
                <div dangerouslySetInnerHTML={{ __html: svg }} />
              </div>
              <div className={styles.demoInfo}>
                <h3>{demoCharts[currentDemo].title}</h3>
                <p>{demoCharts[currentDemo].description}</p>
                <div className={styles.demoActions}>
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />}
                    onClick={() => {
                      setMermaidCode(demoCharts[currentDemo].code);
                      setChartType(demoCharts[currentDemo].type);
                      setIsEditModalVisible(true);
                    }}
                  >
                    编辑此示例
                  </Button>
                  <Button 
                    icon={<CopyOutlined />}
                    onClick={() => {
                      setMermaidCode(demoCharts[currentDemo].code);
                      setChartType(demoCharts[currentDemo].type);
                      message.success('已复制到编辑器');
                    }}
                  >
                    复制代码
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 历史时间轴 */}
        <div className={styles.historyTimeline}>
          <Card 
            title={<span className={styles.cardTitle}><ClockCircleOutlined /> 生成历史</span>}
            extra={<Button type="link">查看全部</Button>}
          >
            <Timeline
              items={history.map((item, index) => ({
                key: index,
                label: new Date(item.time).toLocaleString(),
                color: item.type === 'flowchart' ? 'blue' : item.type === 'mindmap' ? 'green' : 'purple',
                children: (
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}>
                      <span className={styles.timelineType}>
                        {item.type === 'flowchart' ? <BorderOutlined /> : 
                         item.type === 'mindmap' ? <AppstoreOutlined /> : 
                         <BlockOutlined />}
                        {' '}
                        {chartTypes.find(t => t.value === item.type)?.label}
                      </span>
                      <div className={styles.timelineActions}>
                        <Tooltip title="复制">
                          <Button 
                            type="link" 
                            icon={<CopyOutlined />}
                            onClick={() => {
                              setMermaidCode(item.code);
                              setChartType(item.type);
                              message.success('已复制到编辑器');
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="编辑">
                          <Button 
                            type="link" 
                            icon={<EditOutlined />}
                            onClick={() => {
                              setMermaidCode(item.code);
                              setChartType(item.type);
                              setInputContent(item.content);
                              setIsEditModalVisible(true);
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="导出PNG">
                          <Button 
                            type="link" 
                            icon={<FileImageOutlined />} 
                            onClick={() => handleExport('png')}
                          />
                        </Tooltip>
                        <Tooltip title="删除">
                          <Button 
                            type="link" 
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              setHistory(prev => prev.filter((_, i) => i !== index));
                              message.success('已删除');
                            }}
                          />
                        </Tooltip>
                      </div>
                    </div>
                    <p>{item.content}</p>
                  </div>
                ),
              }))}
            />
          </Card>
        </div>
      </div>

      {/* 生成部分 */}
      <div className={styles.generateSection}>
        <Card title="生成流程图">
          <div className={styles.generateContent}>
            <div className={styles.inputSection}>
              <div className={styles.typeSelector}>
                <h3>选择知识库和课程</h3>
                <div className={styles.selectPanel}>
                  {/* 知识库选择弹窗触发 */}
                  知识库：
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
                  课程：
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
                
              </div>
              <div className={styles.typeSelector}>
                <h3>选择图表类型</h3>
                <div className={styles.typeCards}>
                  {chartTypes.map(t => (
                    <div
                      key={t.value}
                      className={`${styles.typeCard} ${chartType === t.value ? styles.active : ''}`}
                      onClick={() => setChartType(t.value)}
                    >
                      <div className={styles.typeIcon}>
                        {t.value === 'flowchart' ? <BorderOutlined /> : 
                         t.value === 'mindmap' ? <AppstoreOutlined /> : 
                         <BlockOutlined />}
                      </div>
                      <div className={styles.typeInfo}>
                        <span className={styles.typeName}>{t.label}</span>
                        <span className={styles.typeDesc}>
                          {t.value === 'flowchart' ? '展示流程和决策' : 
                           t.value === 'mindmap' ? '构建思维导图' : 
                           '展示组织架构'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.inputArea}>
                <h3>输入内容描述</h3>
                <div className={styles.inputWrapper}>
                  <TextArea
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    placeholder="请输入您想要生成的图表内容描述..."
                    rows={6}
                    className={styles.contentInput}
                  />
                  <div className={styles.inputTips}>
                    <div className={styles.tipItem}>
                      <InfoCircleOutlined />
                      <span>描述越详细，生成的图表越准确</span>
                    </div>
                    <div className={styles.tipItem}>
                      <BulbOutlined />
                      <span>可以包含节点关系、层级结构等信息</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.generateActions}>
                <Button 
                  type="default" 
                  icon={<ClearOutlined />}
                  onClick={() => setInputContent('')}
                >
                  清空内容
                </Button>
                <Button 
                  type="primary" 
                  icon={<ThunderboltOutlined />}
                  onClick={handleGenerate}
                  loading={isGenerating}
                >
                  智能生成
                </Button>
              </div>
            </div>
            <div className={styles.previewSection}>
              <div className={styles.previewHeader}>
                <h3>图表预览</h3>
                <div className={styles.previewActions}>
                  <Tooltip title="编辑">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => setIsEditModalVisible(true)}
                    />
                  </Tooltip>
                  <Tooltip title="导出PNG">
                    <Button
                      type="text"
                      icon={<FileImageOutlined />}
                      onClick={() => handleExport('png')}
                    />
                  </Tooltip>
                  <Tooltip title="导出SVG">
                    <Button
                      type="text"
                      icon={<DownloadOutlined />}
                      onClick={() => handleExport('svg')}
                    />
                  </Tooltip>
                  <Tooltip title="保存图表">
                    <Button
                      type="text"
                      icon={<SaveTwoTone />}
                      onClick={() => setIsSaveModalOpen(true)}
                    />
                  </Tooltip>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={() => {
                      setHistory([{
                        type: chartType,
                        code: mermaidCode,
                        content: inputContent,
                        time: Date.now()
                      }, ...history]);
                      setSvg('');
                      setInputContent('');
                      message.success('已保存到历史记录');
                    }}
                  >
                    确认完成
                  </Button>
                  <Tooltip title="放大"><Button type="text" icon={<PlusOutlined />} onClick={handleZoomIn} /></Tooltip>
                  <Tooltip title="缩小"><Button type="text" icon={<MinusOutlined />} onClick={handleZoomOut} /></Tooltip>
                  <Tooltip title="居中"><Button type="text" icon={<CompressOutlined />} onClick={handleCenter} /></Tooltip>
                </div>
              </div>
              <div className={styles.previewContent} ref={previewRef} style={{ position: 'relative', overflow: 'auto', minHeight: 400 }}>
                { Mermaid ? (
                  chartType==='KnowledgeGraph'?(
                    <MindMap code={content} setCode={setContent} zoom={zoom} />
                  ):(
                    <>
                     <div
                      style={{
                        transform: `scale(${scale}) translate(${(centered ? getCenterTransform().x : translate.x) / scale}px, ${(centered ? getCenterTransform().y : translate.y) / scale}px)`,
                        transformOrigin: '0 0',
                        transition: dragging ? 'none' : 'transform 0.2s cubic-bezier(.4,2,.6,1)',
                        width: '100%',
                        minHeight: '400px',
                        cursor: dragging ? 'grabbing' : 'grab',
                      }}
                      onMouseDown={handleMouseDown}
                      dangerouslySetInnerHTML={{ __html: Mermaid }}
                   ></div>
                    </>
                   
                  )
                ) : (
                  <div className={styles.emptyPreview}>
                    <FileImageOutlined />
                    <span>暂无预览内容</span>
                    <span className={styles.emptyTip}>生成的图表将在此处显示</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 编辑弹窗 */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            <EditOutlined /> 编辑流程图
          </div>
        }
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        width={1200}
        footer={[
          <Button key="cancel" onClick={() => setIsEditModalVisible(false)}>
            取消
          </Button>,
          <Button key="export" onClick={() => handleExport('png')} icon={<DownloadOutlined />}>
            导出PNG
          </Button>,
          <Button key="save" type="primary" onClick={async () => {
            const success = await renderMermaid(mermaidCode);
            if (success) {
              setIsEditModalVisible(false);
              message.success('保存成功');
            }
          }}>
            保存
          </Button>,
        ]}
      >
        <div className={styles.editModalContent}>
          <div className={styles.codeEditor}>
            <div className={styles.editorToolbar}>
              <Button.Group>
                <Tooltip title="添加矩形">
                  <Button icon={<BorderOutlined />} onClick={() => addShape('rect')} />
                </Tooltip>
                <Tooltip title="添加圆形">
                  <Button icon={<AppstoreOutlined />} onClick={() => addShape('circle')} />
                </Tooltip>
                <Tooltip title="添加菱形">
                  <Button icon={<BlockOutlined />} onClick={() => addShape('diamond')} />
                </Tooltip>
                <Tooltip title="添加连接线">
                  <Button icon={<LinkOutlined />} onClick={() => setMermaidCode(prev => prev + '\n-->')} />
                </Tooltip>
              </Button.Group>
            </div>
            <TextArea
              value={mermaidCode}
              onChange={(e) => {setMermaidCode(e.target.value); renderMermaid1(e.target.value)}}
              rows={20}
              style={{ fontFamily: 'monospace' }}
            />
          </div>
          <div className={styles.livePreview}>
            <div className={styles.previewToolbar}>
              <Tooltip title="缩小">
                <Button 
                  icon={<ZoomOutOutlined />} 
                  onClick={() => setSvgScale(s => Math.max(0.5, s - 0.1))} 
                />
              </Tooltip>
              <Slider
                min={0.5}
                max={2}
                step={0.1}
                value={svgScale}
                onChange={setSvgScale}
                style={{ width: 100, margin: '0 8px' }}
              />
              <Tooltip title="放大">
                <Button 
                  icon={<ZoomInOutlined />} 
                  onClick={() => setSvgScale(s => Math.min(2, s + 0.1))} 
                />
              </Tooltip>
            </div>
            <div className={styles.previewContainer}> 
              <div 
                className={styles.previewContent}
                style={{ transform: `scale(${svgScale})` }}
              >
                {Mermaid ? (
                  <div dangerouslySetInnerHTML={{ __html: Mermaid }} />
                ) : (
                  <div className={styles.emptyPreview}>
                    暂无预览
                  </div>
                )}
              </div>
              
            </div>
           
          </div>
        </div>
      </Modal>
      {isSaveModalOpen && (
        <div className={styles.saveModalOverlay} onClick={() => setIsSaveModalOpen(false)}>
          <div className={styles.saveModalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>保存图表</h3>
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
                <div className={styles.text}>放入图表库</div>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>图表名称</label>
              <input
                type="text"
                name="name"
                value={saveFormData.name}
                onChange={handleInputChange}
                placeholder="请输入教案名称"
              />
            </div>

            <div className={styles.formGroup}>
              <label>图表备注</label>
              <textarea
                name="notes"
                value={saveFormData.notes}
                onChange={handleInputChange}
                placeholder="请输入教案备注信息"
              />
            </div>
            <div className={styles.formGroup}>
              <label>图表预览</label>
              <div className={styles.image}>
                <img src={imgDataUrl} alt="图表" />
              </div>
              
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
                        <div className={styles.knowledgeFiles}>创建时间：{item.createTime?.split('T')}</div>
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
                        <div className={styles.knowledgeDesc}>{item.knowledgebaseIntroduction}</div>
                        <div className={styles.knowledgeFiles}>创建时间：{item.startTime?.split('T')[0]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
    </div>
  );
};

export default FlowChart;
