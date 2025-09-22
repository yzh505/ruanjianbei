import React, { useState,useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Input, Button, Tag, Statistic, Form, Select, Upload, message, Modal } from 'antd';
import {
  UploadOutlined,
  CheckCircleOutlined,
  UserOutlined,
  BookOutlined,
  RocketOutlined,
  LoadingOutlined,
  ProfileOutlined,
  ReadOutlined,
  ExperimentOutlined,
  TrophyOutlined,
  TeamOutlined,
  EyeOutlined,
  DownloadOutlined,
  SaveOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FilePptOutlined
} from '@ant-design/icons';
import styles from '../../scss/personalize/recommendations.module.scss';
import { getPersonFeature,getResourceRecommend } from '../../api/coursedesign';
import {getCourseList} from '../../api/coursedesign'
import { useNavigate } from 'react-router-dom';
import {recommendQuestion} from '../../api/exercise'
const { TextArea } = Input;

const Recommendations = () => {
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const navigate = useNavigate();
  const [courseOptions,setCourseOptions] = useState([
      { label: '语文', value: 'chinese', desc: '人文素养与阅读写作', createdAt: '2024-06-01' },
      { label: '数学', value: 'math', desc: '逻辑思维与解题能力', createdAt: '2024-05-20' },
      { label: '英语', value: 'english', desc: '听说读写全方位提升', createdAt: '2024-05-15' },
      { label: '物理', value: 'physics', desc: '实验探究与理论结合', createdAt: '2024-04-30' },
    ]);
  const [selectedCourse, setSelectedCourse] = useState(8);
  const selectedCourseObj = courseOptions.find(c => c.courseId === selectedCourse);
  const filteredCourseList = courseOptions.filter(item =>
    item.courseName?.includes(courseSearch)
  );
  
  const handleSelectCourseModal = (item) => {
    setSelectedCourse(item.courseId);
    setIsCourseModalOpen(false);
    setCourseSearch('');
  };
  // 雷达图数据
  const radarData = [
    { name: '互动性', value: 80 },
    { name: '案例驱动', value: 70 },
    { name: '理科特长', value: 90 },
    { name: '经验', value: 60 },
    { name: '创新力', value: 75 }
  ];

  // ECharts 雷达图配置
  const radarOption = {
    tooltip: {},
    radar: {
      indicator: radarData.map(item => ({ name: item.name, max: 100 })),
      radius: 70,
      splitNumber: 4,
      axisName: { color: '#1890ff', fontSize: 14 },
      splitLine: { lineStyle: { color: ['#e6f7ff', '#91d5ff'] } },
      splitArea: { areaStyle: { color: ['#f0f7ff', '#fff'] } },
    },
    series: [{
      type: 'radar',
      data: [{
        value: radarData.map(item => item.value),
        name: '个人特征',
        areaStyle: { color: 'rgba(24,144,255,0.3)' },
        lineStyle: { color: '#1890ff', width: 3 },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#1890ff' }
      }]
    }]
  };

    // 数据面板统计
  const stats = {
    total: 128,
    generated: 45,
    inProgress: 12,
    completed: 71
  };

  // 画像数据
  const [featureProfile,setFeatureProfile] = useState({
    innovation: 3,
    knowledagePoint: 2,
    resource: 4,
    practicability: 3,
    teachingExperience: 1,
    resourceAdaptability: 4,
    featureIntro: "课程资源以图片为主，涵盖计算机组成原理和Java相关内容，资源适配度较高，但缺乏视频资源，教学经验维度得分较低。",
    tags: [
      "计算机组成原理",
      "Java程序设计",
      "流程图",
      "思维导图",
      "时序图",
      "数组与方法",
      "数据流处理",
      "CPU",
      "性能影响",
      "指令系统"
    ]
  });

  // 推荐资源数据（替换为你的数据）
  const [recommendedResources,setRecommendedResources] = useState([
    {
        resourceId: 113,
        resourceName: "计算机组成原理——总线系统",
        resourceType: "teachingplan",
        resourceScore: 0.580389438771592,
        resourceTags: ["总线概念", "总线分类", "通信方式", "仲裁机制", "性能影响"]
    },
    {
        resourceId: 31,
        resourceName: "图表1",
        resourceType: "Mindmap",
        resourceScore: 0.517714312736688,
        resourceTags: ["学习记录", "数据流处理", "前端UI设计", "网络通信", "业务逻辑", "推理分析", "数据存储管理", "系统运维", "数据库设计"]
    },
    {
        resourceId: 36,
        resourceName: "图表1",
        resourceType: "Mindmap",
        resourceScore: 0.517714312736688,
        resourceTags: ["学习记录", "数据流处理", "前端UI设计", "网络通信", "业务逻辑", "推理分析", "数据存储管理", "系统运维", "数据库设计"]
    },
    {
        resourceId: 110,
        resourceName: "计算机的基本组成教案1",
        resourceType: "teachingplan",
        resourceScore: 0.4642872106202608,
        resourceTags: ["计算机组成", "硬件识别", "软件分类", "互动教学", "任务驱动"]
    },
    {
        resourceId: 111,
        resourceName: "计算机发展历程",
        resourceType: "teachingplan",
        resourceScore: 0.45182387759317016,
        resourceTags: ["计算机发展", "技术演进", "四代计算机", "教学目标", "历史案例"]
    },
    {
        resourceId: 38,
        resourceName: "计算机组成原理教案",
        resourceType: "teachingplan",
        resourceScore: 0.428201595100777,
        resourceTags: ["计算机组成", "冯诺依曼结构", "指令系统", "存储层次", "实验教学"]
    },
    {
        resourceId: 40,
        resourceName: "计算机组成原理教案",
        resourceType: "teachingplan",
        resourceScore: 0.428201595100777,
        resourceTags: ["计算机组成", "冯诺依曼结构", "指令系统", "存储层次", "实验教学"]
    },
    {
        resourceId: 35,
        resourceName: "计算机的基本组成",
        resourceType: "Mindmap",
        resourceScore: 0.4211596308218479,
        resourceTags: ["计算机组成原理", "基本组成", "冯·诺依曼体系", "五大部件", "存储器与输入输出设备"]
    },
    {
        resourceId: 39,
        resourceName: "教案1",
        resourceType: "teachingplan",
        resourceScore: 0.4143645623269244,
        resourceTags: ["计算机组成", "数据表示", "指令系统", "硬件结构", "实验教学"]
    },
    {
        resourceId: 41,
        resourceName: "教案1",
        resourceType: "teachingplan",
        resourceScore: 0.4143645623269244,
        resourceTags: ["计算机组成", "数据表示", "指令系统", "硬件结构", "实验教学"]
    }
  ]);
  // 推荐资源分页显示
  const [resourcePage, setResourcePage] = useState(1);
  const pageSize = 3;
  const pagedResources = recommendedResources.slice((resourcePage-1)*pageSize, resourcePage*pageSize);
  // 换一换功能可按需实现
  const handleChangeResources = () => {
    message.info('已展示全部推荐资源');
  };

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewResource, setPreviewResource] = useState(null);


  const handlePreview = (resource) => {
    console.log(resource);
    if(resource.resourceType==='teachingplan'){
      navigate('/TeacherPlanDe/'+resource.resourceId)
    }else if(resource.resourceType==='Mindmap'){
      navigate('/FlowCharDe/'+resource.resourceId)
    }else if(resource.resourceType==='ppt'){
      
    }else if(resource.resourceType===''){
      
    }else if(resource.resourceType==='Mindmap'){
      
    }else if(resource.resourceType==='Mindmap'){
      
    }else if(resource.resourceType==='Mindmap'){
      
    }
    
  };

  const handleDownload = (resource) => {
    message.success(`开始下载: ${resource.title}`);
    // 这里添加实际的下载逻辑
  };

  const handleSave = (resource) => {
    message.success(`已保存到个人库: ${resource.title}`);
    // 这里添加实际的保存逻辑
  };

  const handlePersonalInput = (values) => {
    message.success('个性化内容已提交，正在生成推荐...');
  };

  const getBaseList =async ()=>{
    try{
      const [
        res2
      ] = await Promise.all([
       /*  getPersonFeature(),
        getResourceRecommend('courseId', 'tags'), */
        getCourseList()
      ]);
      setCourseOptions(res2.data.data)
      setSelectedCourse(res2.data.data[0].courseId);
    } catch (error) {
      message.error('保存失败，请重试！');
    } 
  }
   const recommed =async (selectedCourse)=>{
    try{
      const [
        res,
      ] = await Promise.all([
        getPersonFeature(selectedCourse,'ONE_WEEK'),
      ]);
      setFeatureProfile(res.data.data)
      const res2 =await getResourceRecommend(selectedCourse, res.data.data.tags);
      setRecommendedResources(res2.data.data)
    } catch (error) {
      message.error('保存失败，请重试！'); 
    } 
  }
useEffect( () => {
  getBaseList();
}, []);
useEffect( () => {
  recommed(selectedCourse);
}, [selectedCourse]);
const [inputTags, setInputTags] = useState('');
const [recommendList, setRecommendList] = useState([]);
const [recommendedQuestions,setRecommenderQue] = useState([]);
const getQuestionRe = async() => {
  const res =await recommendQuestion(inputTags);
  setRecommenderQue(res.data.data)
};

// 监听输入变化，解析标签并生成推荐列表
useEffect(() => {
  if (inputTags) {
    const tagsArr = inputTags.split(',').map(s => s.trim()).filter(Boolean);
    setRecommendList(tagsArr);
  } else {
    setRecommendList([]);
  }
}, [inputTags]);
  return (
    <div className={styles.recommendationsContainer}>
      <div className={styles.header}>
        <h>个性化资源推荐</h>
        <p>基于您的教学风格、专业特长和历史数据，为您推荐最适合的教学资源</p>
      </div>
      <div className={styles.content}>
        <div className={styles.recommendedResources}>
          <div className={styles.resourcesTitle}>
            <ReadOutlined className={styles.icon} />
            推荐资源
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
            <Button type="link" size="small" style={{marginLeft: 'auto'}} onClick={handleChangeResources}>
              换一换
            </Button>
          </div>
          <div className={styles.resourceListModern}>
            {pagedResources.map(resource => (
              <div
                key={resource.resourceId}
                className={styles.resourceModernCard}
                hoverable
                style={{
                  background: 'linear-gradient(135deg, #e6f4ff 0%, #fff 100%)',
                  boxShadow: '0 4px 16px rgba(24,144,255,0.10)',
                  border: 'none',
                  borderRadius: 16,
                  transition: 'transform 0.3s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 20, color: '#1890ff', filter: 'drop-shadow(0 2px 8px #91d5ff)' }}>
                    {/* 图标类型可根据 resourceType 匹配 */}
                    {resource.resourceType === 'teachingplan' && <FilePdfOutlined />}
                    {resource.resourceType === 'Mindmap' && <FilePptOutlined />}
                    {/* 其它类型可补充 */}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#555' }}>{resource.resourceName}</div>
                  <div className={styles.point} style={{display:'flex',alignItems: 'center',marginLeft: 'auto'}}>
                    <h>推荐指数：</h>
                    <div style={{ marginLeft: 'auto', fontSize: 18, color: '#52c41a', fontWeight: 600 }}>
                      {(resource.resourceScore * 100).toFixed(0)}/100
                    </div>
                  </div>
                </div>
                <div className={styles.resourceExplanation}>
                  类型：{resource.resourceType}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {resource.resourceTags.map(tag => (
                      <Tag key={tag} color="geekblue" style={{ fontSize: 13, padding: '2px 12px', borderRadius: 6, fontWeight: 500 }}>{tag.trim()}</Tag>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      className={styles.operationButton}
                      onClick={() => handlePreview(resource)}
                      style={{ borderRadius: 22, fontWeight: 500 }}
                    >
                      打开
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* 推荐资源分页按钮 */}
          <div style={{textAlign:'center',marginTop:'18px'}}>
            <Button
              type="default"
              disabled={resourcePage === 1}
              style={{marginRight:8}}
              onClick={()=>setResourcePage(resourcePage-1)}
            >上一页</Button>
            <Button
              type="default"
              disabled={resourcePage*pageSize>=recommendedResources.length}
              onClick={()=>setResourcePage(resourcePage+1)}
            >下一页</Button>
          </div>
        </div>
        <div className={styles.referenceData}>
          <div className={styles.referenceTitle}>
            <UserOutlined className={styles.icon} />
            个人特征画像
          </div>
          <div className={styles.referenceRadar}>
            {/* 雷达图可根据 featureProfile 动态生成 */}
            <ReactECharts
              option={{
                tooltip: {},
                radar: {
                  indicator: [
                    { name: '创新度', max: 5 },
                    { name: '知识点覆盖', max: 5 },
                    { name: '资源丰富度', max: 5 },
                    { name: '实用性', max: 5 },
                    { name: '教学经验', max: 5 },
                    { name: '资源适配度', max: 5 }
                  ],
                  radius: 70,
                  splitNumber: 5,
                  axisName: { color: '#1890ff', fontSize: 14 },
                  splitLine: { lineStyle: { color: ['#e6f7ff', '#91d5ff'] } },
                  splitArea: { areaStyle: { color: ['#f0f7ff', '#fff'] } },
                },
                series: [{
                  type: 'radar',
                  data: [{
                    value: [
                      featureProfile?.innovation,
                      featureProfile?.knowledagePoint,
                      featureProfile?.resource,
                      featureProfile?.practicability,
                      featureProfile?.teachingExperience,
                      featureProfile?.resourceAdaptability
                    ],
                    name: '资源画像',
                    areaStyle: { color: 'rgba(24,144,255,0.3)' },
                    lineStyle: { color: '#1890ff', width: 3 },
                    symbol: 'circle',
                    symbolSize: 8,
                    itemStyle: { color: '#1890ff' }
                  }]
                }]
              }}
              style={{ height: 220, width: '100%' }}
            />
          </div>
          <div className={styles.referenceList}>
            <div className={styles.dataItem}>
              <div className={styles.dataTitle}>
                <BookOutlined className={styles.icon} />特征简介
              </div>
              <div className={styles.dataValue} style={{color:'#555'}}>
                {featureProfile?.featureIntro}
              </div>
            </div>
            <div className={styles.dataItem}>
              <div className={styles.dataTitle}>
                <RocketOutlined className={styles.icon} />标签
              </div>
              <div className={styles.dataValue}>
                {featureProfile?.tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
   

      <div className={styles.bottom}>
        <div className={styles.inputSection}>
          <div className={styles.inputTitle}>个性化输入</div>
          <Form layout="vertical">
            <Form.Item label="标签输入（逗号分隔）">
              <Input
                placeholder="如：流程图,思维导图,知识图谱"
                value={inputTags}
                onChange={e => setInputTags(e.target.value)}
                allowClear
                style={{ marginBottom: 8 }}
              />
            </Form.Item>
            <Form.Item label="资源类型">
              <Select
                mode="multiple"
                placeholder="请选择资源类型"
                style={{ width: '100%', marginBottom: 8 }}
                options={[
                  { label: '流程图', value: '流程图' },
                  { label: '思维导图', value: '思维导图' },
                  { label: '知识图谱', value: '知识图谱' },
                  { label: 'PPT', value: 'PPT' },
                  { label: '教案', value: '教案' },
                  { label: '视频', value: '视频' },
                ]}
                onChange={vals => setInputTags(vals.join(','))}
                value={inputTags.split(',').filter(Boolean)}
                allowClear
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" icon={<RocketOutlined />} style={{width: '100%'}} onClick={()=>{getQuestionRe()}}>
                智能题目推荐
              </Button>
            </Form.Item>
          </Form>
          <div>
            <div style={{fontSize: '16px', fontWeight: 500, marginBottom: 12}}>已输入标签：</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {recommendList.length === 0 ? (
                <span style={{color:'#aaa'}}>暂无标签，请输入或选择标签</span>
              ) : (
                recommendList.map((tag, idx) => (
                  <Tag key={idx} color="blue">{tag}</Tag>
                ))
              )}
            </div>
          </div>
          <div style={{marginTop: 18, background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', boxShadow: '0 2px 8px #e6f7ff'}}>
            <div style={{fontSize: 15, color: '#1890ff', fontWeight: 500, marginBottom: 6}}>
              高级提示
            </div>
            <ul style={{paddingLeft: 18, color: '#666', fontSize: 13, marginBottom: 0}}>
              <li>可输入多个标签，提升推荐精准度</li>
              <li>详细描述教学场景，获取更个性化资源</li>
              <li>支持选择资源类型，快速筛选所需内容</li>
            </ul>
          </div>
        </div>
        <div className={styles.recommendationSection}>
          {recommendList.length === 0 ? (
            <div style={{color:'#aaa'}}>请在左侧输入标签后查看推荐</div>
          ) : (
            <>
              <div style={{marginTop: 24}}>
                <div style={{fontWeight: 600, fontSize: 17, color: '#1890ff', marginBottom: 10}}>推荐题目列表</div>
                {recommendedQuestions.map((q, i) => (
                  <div key={q.id} className={styles.questionCard} style={{
                    background: '#f6faff',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px #e6f7ff',
                    padding: '16px 18px',
                    marginBottom: 18
                  }}>
                    <div style={{fontWeight: 600, fontSize: 16, marginBottom: 6}}>
                      {q.questionName || `题目${i + 1}`} <Tag color="blue">{q.type}</Tag>
                    </div>
                    <div style={{marginBottom: 8, color: '#333'}}>{q.question}</div>
                    {q.options && q.options.length > 0 && (
                      <div style={{marginBottom: 8}}>
                        <div style={{fontWeight: 500}}>选项：</div>
                        <ul style={{margin: 0, paddingLeft: 24}}>
                          {q.options.map((opt, idx2) => (
                            <li key={idx2}>{opt.text}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div style={{color: '#1890ff', marginBottom: 6}}>答案：{q.answer}</div>
                    {q.analysis && (
                      <div style={{color: '#faad14', fontSize: 13, marginBottom: 6}}>解析：{q.analysis}</div>
                    )}
                    <div style={{fontSize: 13, color: '#888'}}>
                      学科：{q.subject} | 难度：{q.difficulty} | 浏览量：{q.questionViews}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        title={previewResource?.title}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button 
            key="download" 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => {
              handleDownload(previewResource);
              setPreviewVisible(false);
            }}
          >
            下载
          </Button>,
          <Button 
            key="save" 
            icon={<SaveOutlined />}
            onClick={() => {
              handleSave(previewResource);
              setPreviewVisible(false);
            }}
          >
            保存到个人库
          </Button>,
          <Button 
            key="close" 
            onClick={() => setPreviewVisible(false)}
          >
            关闭
          </Button>
        ]}
        width={800}
      >
        <div style={{ padding: '20px' }}>
          <h3>资源说明</h3>
          <p>{previewResource?.explanation}</p>
          <div style={{ marginTop: '16px' }}>
            <h3>标签</h3>
            {previewResource?.tags.map(tag => (
              <Tag key={tag} color="blue">{tag}</Tag>
            ))}
          </div>
          {/* 这里可以添加更多预览内容，如缩略图、文件大小等 */}
        </div>
      </Modal>
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
  );
};

export default Recommendations;
