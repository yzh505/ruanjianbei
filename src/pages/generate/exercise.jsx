import React, { useState, useCallback,useEffect, memo } from 'react';
import { Card, Form, Input, Select, Button, Space, Table, Tag, Modal, message, InputNumber, Radio, Carousel, Timeline, Statistic, Upload, Divider } from 'antd';
import {
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
  FileSearchOutlined,
  CopyOutlined,
  CalculatorOutlined,
  ReadOutlined,
  FunctionOutlined,
  ExperimentOutlined,
  FlaskOutlined,
  GlobalOutlined,
  SettingOutlined,
  NumberOutlined,
  ToolOutlined,
  RiseOutlined,
  BarChartOutlined,
  StarOutlined,
  TeamOutlined,
  LikeOutlined,
  BulbOutlined,
  UploadOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  InboxOutlined,
  CameraOutlined,
  ScanOutlined,
  RobotOutlined,
  FileImageOutlined,
  LoadingOutlined,
  CloudUploadOutlined,
  DownloadOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { FolderPlus,  Close } from '@icon-park/react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import {getCourseList} from '../../api/coursedesign'
import rehypeKatex from 'rehype-katex';
import styles from '../../scss/generate/exercise.module.scss';
import aiStyles from '../../scss/generate/aiSolve.module.scss';
import {getQuestionSum,question, add_question,extractImageText,AiSolving} from '../../api/exercise'
import {getKnowledgebaseList}from '../../api/knowledge'
import {getPrivateResource,addQuestions} from '../../api/courseware'
import {uploadFile} from '../../api/user'
import { text } from 'd3';
// 示例优秀题目数据
const excellentExercises = [
  {
    id: 1,
    title: '微积分基础概念选择题',
    type: 'choice',
    subject: '数学',
    likes: 128,
    usage: 256,
    preview: '这是一道关于微积分基础概念的选择题，涵盖导数和积分的基本定义...'
  },
  {
    id: 2,
    title: '牛顿运动定律应用题',
    type: 'calculation',
    subject: '物理',
    likes: 98,
    usage: 180,
    preview: '一道综合运用牛顿三大运动定律的计算题，考察力学知识的实际应用...'
  },
  {
    id: 3,
    title: '化学平衡移动规律',
    type: 'essay',
    subject: '化学',
    likes: 86,
    usage: 150,
    preview: '分析化学平衡移动规律的论述题，要求学生理解并解释平衡移动的条件...'
  }
];

const { TextArea } = Input;
const { Option } = Select;

// 抽离内容组件
const ExerciseContent = memo(({ activeTab, mockData, columns ,markdownData, parsedQuestions, setIsSaveModalOpen, onSaveQuestion, onEditQuestion }) => {
  const handleSaveAll = async () => {
    if (!parsedQuestions || parsedQuestions.length === 0) {
      message.warning('没有可保存的题目');
      return;
    }
    console.log(parsedQuestions)
    const res = await addQuestions(parsedQuestions);
    message.success('已批量保存所有题目');
  };
  if (activeTab === 'current') {
    return (
      <div className={styles.currentContent}>
        <div className={styles.markdownPreview}>
          <div className={styles.markdownHeader}>
            <h3>习题预览</h3>
            <Button 
              type="primary" 
              icon={<CopyOutlined />}
              onClick={handleSaveAll}
            >
              一键保存
            </Button>
          </div>
          <div className={styles.markdownContent}>
            {parsedQuestions.length === 0 ? (
              <p>暂无题目</p>
            ) : (
              parsedQuestions.map((q, idx) => (
                <div key={idx} className={styles.questionItem}>
                  <div className={styles.questionContent}>
                    <div style={{fontWeight: 'bold', marginBottom: 8}}>题目{idx + 1}：</div>
                    <div style={{marginBottom: 8}}>{q.question}</div>
                    {q.options && q.options.length > 0 && (
                      <div style={{marginBottom: 8}}>
                        <div style={{fontWeight: 500}}>选项：</div>
                        <ul style={{margin: 0, paddingLeft: 24}}>
                          {q.options.map((opt, i) => (
                            <li key={i}>{typeof opt === 'object' ? opt.text : opt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div style={{color: '#1890ff'}}>答案：{q.answer}</div>
                  </div>
                  <div className={styles.questionActions}>
                    <Button
                      className={styles.saveBtn}
                      type="primary"
                      size="small"
                      onClick={() => onSaveQuestion(q)}
                    >
                      保存
                    </Button>
                    <Button
                      className={styles.editBtn}
                      type="default"
                      size="small"
                      onClick={() => onEditQuestion(q, idx)}
                    >
                      修改
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Table
      className={styles.historyTable}
      columns={columns}
      dataSource={mockData}
      rowKey="id"
      pagination={{
        total: mockData?.length,
        pageSize: 7,
        showSizeChanger: true,
        showQuickJumper: true
      }}
    />
  );
});

ExerciseContent.displayName = 'ExerciseContent';

const Exercise = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState('choice');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const token = localStorage.getItem('accessToken');
  const userInfo =JSON.parse(localStorage.getItem('user')) ;
  const [markdownData, setMarkdownData] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [aiSolving, setAiSolving] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [extractedText, setExtractedText] = useState(`题目1：
下列哪些物质属于纯净物？
选项：
A. 空气
B. 蒸馏水
C. 食盐水
D. 氧气`);
  const [solution, setSolution] = useState('');
  const [inputType, setInputType] = useState('image'); // 'image', 'document', 'text'
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFormData, setSaveFormData] = useState({
    course: 'teachingplan',
    name: '',
    notes: ''
  });
  const [questionDo,setQuestionDo]=useState(null)
  const [currentSaveQuestion, setCurrentSaveQuestion] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ question: '', options: [], answer: '' });
  const [editingQuestionIdx, setEditingQuestionIdx] = useState(null);
  const [upUrl,setUpUrl] =useState('')
  const [file,setFile]=useState(null)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSaveFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  // 点击保存按钮，弹出保存弹窗并记录当前题目
  const handleSaveQuestion = (questionObj) => {
    setCurrentSaveQuestion(questionObj);
    setIsSaveModalOpen(true);
  };

  // 确认保存，调用add_question
  const handleSaveSubmit = async () => {
    if (!currentSaveQuestion) return;
    console.log(currentSaveQuestion)
    setIsSaving(true);
    try {
      // 组装要保存的题目信息
      const formattedOptions = (currentSaveQuestion.options || []).map(opt => ({ text: opt }));
      console.log(formattedOptions)
      await add_question({
        ...currentSaveQuestion,
        options: formattedOptions,
        question:currentSaveQuestion.question,
        answer:currentSaveQuestion.answer,
        analysis:currentSaveQuestion?.analysis,
        "type": currentValues.type||currentSaveQuestion.type,
        "difficulty": currentValues.difficulty||currentSaveQuestion.difficult,
        "creatorId": userInfo.uid,
        'subject':currentValues.subject,
        questionName:saveFormData.name,

      });
      setIsSaveModalOpen(false);
      message.success('保存成功');
    } catch (error) {
      console.log(error)
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  // 统计数据
  const [stats,setStats] = useState({
    usageCount: 5,
  });

  // 统计卡片配置
  const [statConfigs,setStatConfigs] = useState([
    {
      key: 'resourceSum',
      title: '总习题数',
      icon: <BarChartOutlined />,
      trend: '较上月增长12%',
      color: '#1890ff'
    },
    {
      key: 'monthSum',
      title: '本月生成',
      icon: <RiseOutlined />,
      trend: '实时更新',
      color: '#52c41a'
    },
    {
      key: 'weekSum',
      title: '本周生成',
      icon: <FileTextOutlined />,
      trend: '覆盖全面',
      color: '#722ed1'
    },
    {
      key: 'daySum',
      title: '今日生成',
      icon: <TeamOutlined />,
      trend: '深受欢迎',
      color: '#f5222d'
    }
  ]);

  // 时间线数据
  const timelineItems = [
    {
      color: 'green',
      children: '2024-03-15 生成了5道微积分选择题',
    },
    {
      color: 'blue',
      children: '2024-03-14 生成了3道物理计算题',
    },
    {
      color: 'red',
      children: '2024-03-13 生成了2道化学实验题',
    },
  ];

  // 功能特点数据
  const features = [
    {
      icon: <BulbOutlined />,
      title: '智能生成',
      description: '基于AI技术，自动生成高质量习题'
    },
    {
      icon: <ToolOutlined />,
      title: '多样题型',
      description: '支持选择、计算、实验等多种题型'
    },
    {
      icon: <StarOutlined />,
      title: '个性定制',
      description: '可根据需求调整难度和知识点'
    }
  ];
  // 模拟数据
  const [mockData,setMockData] =useState([]);

  const handlePreview = useCallback((record) => {
    setPreviewData(record);
    setPreviewVisible(true);
  }, []);

  const handleEdit = useCallback((record) => {
    message.info('编辑功能开发中...');
  }, []);
  const [currentValues,setCurrentValues]=useState(null)
  const handleDelete = useCallback((record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除习题 "${record.title}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        message.success('删除成功');
      }
    });
  }, []);

  const handleGenerate = useCallback(async (values) => {
    setMarkdownData('')
    setGenerating(true);
    console.log('生成习题参数:', values);
    setCurrentValues(values)
    try {
      setActiveTab('current');
       try {
        const response = await fetch(`http://14.103.151.91:8080/Api/xjk/ai/newCreateQuestionChatForText?questionType=${encodeURIComponent(values.type)}&subject=${encodeURIComponent(values.subject)}&questionDifficulty=${encodeURIComponent(values.difficulty)}&questionSum=${encodeURIComponent(values.count)}&questionDescription=${encodeURIComponent(values.description)}&knowledgebaseId=${selectedKnowledge}&courseId=${selectedCourse}`,
          {
            method: 'GET',
            headers: {
              'satoken':token
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No response body');
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          lines.forEach(line => {
            const cleanedLine = line.replace("data:", "").replace(/<br>/g, '\n');
            setMarkdownData(prevSections => {
              return prevSections+cleanedLine;
            })
            
          });
        }
      } catch (err) {
        console.error('Failed to fetch textbooks:', err);
        message.error('生成失败，请重试');
      } finally {
      }
      form.resetFields();
    } catch (error) {
      message.error('生成失败，请重试');
    } finally {
      setGenerating(false);
    }

  }, [form]);

  const handleTabChange = useCallback((key) => {
    setActiveTab(key);
  }, []);

  const [solveMarkdownData, setSolveMarkdownData] = useState(`  `);
  const [solveData,setSolveData]=useState( [])
  const handleSolve = async () => {
    setAiSolving(true);
      setSolveMarkdownData("")
    try {
      // TODO: 调用AI解题API
        if(inputType=='document'){
          const fileData =new FormData();
          fileData.append('file',file)
          const response = await extractImageText(fileData);
          setSolveData(response.data.data)

          message.success('文档提取完成');
         }else{
          let imageUrlOrText=extractedText;
          let  type='text'
           if(inputType=='image'){
            imageUrlOrText=upUrl;
            type='image_url'
           }
          const response = await fetch(`http://14.103.151.91:8080/Api/xjk/ai/AiSolving?imageUrlOrText=${imageUrlOrText}&type=${type}`,
            {
              method: 'GET',
              headers: {
                'satoken':token
              },
            }
          );
          if (!response.body) {
            throw new Error('No response body');
          }
          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            lines.forEach(line => {
              const cleanedLine = line.replace("data:", "").replace(/<br>/g, '\n')
              
              setSolveMarkdownData(prevSections => {
                console.log(prevSections+cleanedLine)
                return (prevSections+cleanedLine);
              })
              
            });
          }
      message.success('解题完成');
        }
       
    } catch (error) {
      message.error('解题失败，请重试');
    } finally {
      setAiSolving(false);
    }
  };

  // 统计数据板数据
  const totalCount = mockData?.length;
  const tagCount = {};
  const typeCount = {};
  const difficultyCount = {};
  mockData?.forEach(item => {
    // 标签统计
    item?.tags?.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
    // 题型统计
    typeCount[item.type] = (typeCount[item.type] || 0) + 1;
    // 难度统计
    difficultyCount[item.difficulty] = (difficultyCount[item.difficulty] || 0) + 1;
  });
  const tagTotal = Object.values(tagCount).reduce((a, b) => a + b, 0);

  const columns = [
    {
      title: '题目标题',
      dataIndex: 'questionName',
      key: 'questionName',
      render: (text, record) => (
        <Space>
          <FileTextOutlined />
          {text}
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = {
          choice: { color: 'blue', text: '选择题' },
          calculation: { color: 'green', text: '计算题' },
          reading: { color: 'orange', text: '阅读理解' },
          essay: { color: 'purple', text: '论述题' }
        };
        return <Tag color='blue'>{type}</Tag>;
      }
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty) => {
        const difficultyMap = {
          easy: { color: 'green', text: '简单' },
          medium: { color: 'orange', text: '中等' },
          hard: { color: 'red', text: '困难' }
        };
        return <Tag color='green'>
          {difficulty===1&&'极易'}
          {difficulty===2&&'简单'}
          {difficulty===3&&'中等'}
          {difficulty===4&&'困难'}
          {difficulty===5&&'极难'}
          </Tag>;
      }
    },
    {
      title: '学科',
      dataIndex: 'subject',
      key: 'subject'
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => (
        <>
          {tags?.map(tag => (
            <Tag key={tag} color="cyan">{tag}</Tag>
          ))}
        </>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => {
        return <Tag color='orange'>{createdAt?.split('T')[0]}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<PlayCircleOutlined />} 
            onClick={() => handlePreview(record)}
          >
            预览
          </Button>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];
  const fetchData =async ()=>{
    const res =await  getPrivateResource({
      searchUserId: parseInt(userInfo.uid),
      pageNum:1,
      pageSize:15,
      searchKey:'',
      resourceType:'题目',
      resourceViews:0
    });
    console.log(res.data.data)
    setMockData(res.data.data)

  }
useEffect(() => { 
  fetchData();
  
}, []);
  
  // 解析 markdownData 为题目对象数组
  useEffect(() => {
    if (!markdownData) {
      setParsedQuestions([]);
      console.log(markdownData+'111')
      return;
    }
    // 按 --- 拆分
    const blocks = markdownData.split(/\n?---+\n?/).map(b => b.trim()).filter(Boolean);
    const questions = blocks.map(block => {
      // 新解析逻辑：
      // 1. 第一行（非空）为题干（去除题号如“1.”、“2.”等）
      // 2. 选项为A./B./C./D.等开头的行
      // 3. 最后出现的“答案：”为答案
      const lines = block.split(/\n/).map(l => l.trim()).filter(Boolean);
      let question = '', answer = '', options = [];
      let foundQuestion = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!foundQuestion && line) {
          // 题干，去除题号
          question = line.replace(/^\d+\.?\s*/, '');
          foundQuestion = true;
          continue;
        }
        if (/^[A-D][.、\s]/.test(line)) {
          options.push(line);
        } else if (/^答案[:：]/.test(line)) {
          answer = line.replace(/^答案[:：]/, '').trim();
        }
      }
      const formattedOptions1 = (options || []).map(opt => ({ text: opt }));
       console.log(formattedOptions1)
      return { question, options, answer,
        "type": currentValues.type||currentSaveQuestion.type,
        "difficulty": currentValues.difficulty||currentSaveQuestion.difficult,
        "creatorId": userInfo.uid,
        'subject':currentValues.subject,
        'options':formattedOptions1
      };
    });
    setParsedQuestions(questions);
  }, [markdownData]);
  
  // 修改按钮点击，弹窗并填充数据
  const handleEditQuestion = (q, idx) => {
    setEditFormData({
      question: q.question,
      options: q.options ? [...q.options] : [],
      answer: q.answer || ''
    });
    setEditingQuestionIdx(idx);
    setIsEditModalOpen(true);
  };

  // 编辑弹窗表单变更
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };
  // 编辑选项变更
  const handleEditOptionChange = (i, value) => {
    setEditFormData(prev => {
      const opts = [...prev.options];
      opts[i] = value;
      return { ...prev, options: opts };
    });
  };
  // 添加选项
  const handleAddOption = () => {
    setEditFormData(prev => ({ ...prev, options: [...prev.options, ''] }));
  };
  // 删除选项
  const handleRemoveOption = (i) => {
    setEditFormData(prev => {
      const opts = [...prev.options];
      opts.splice(i, 1);
      return { ...prev, options: opts };
    });
  };
  // 保存编辑
  const handleEditSave = () => {
    if (editingQuestionIdx == null) return;
    setParsedQuestions(prev => {
      const arr = [...prev];
      arr[editingQuestionIdx] = {
        ...arr[editingQuestionIdx],
        question: editFormData.question,
        options: editFormData.options,
        answer: editFormData.answer
      };
      return arr;
    });
    setIsEditModalOpen(false);
  };
  const uploadProps = {
     name: 'file',
     multiple: true,
    customRequest: async ({ file, onSuccess, onError }) => {
      if(inputType=='document'){
        setFile(file)
      }
       try {
         const fileData= new FormData();
         fileData.append('file',file);
         const res= await uploadFile(fileData);
         console.log(res.data.data.fileUrl);
         setUpUrl(res.data.data.fileUrl)
         onSuccess();
       } catch (error) {
         onError(error);
       }
     },
     onChange(info) {
       const { status } = info.file;
       if (status === 'done') {
         message.success(`${info.file.name} 上传成功`);
         
       }
     },
   };
 const [selectedKnowledge, setSelectedKnowledge] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(8);
  const knowledgeOptions = [
    { label: '语文知识库', value: 'chinese' },
    { label: '数学知识库', value: 'math' },
    { label: '英语知识库', value: 'english' },
    { label: '物理知识库', value: 'physics' },
  ];
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
  const [knowledgeList,setKnowledgeList] = useState([{
      "knowledgebaseId": 0,
      "knowledgebaseName": "",
      "knowledgebaseIntroduction": "",
      "useNumber": 0,
      "createTime": ""
    }]);
  const selectedKnowledgeObj = knowledgeList?.find(k => k.knowledgebaseId === selectedKnowledge);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const filteredKnowledgeList = knowledgeList?.filter(item =>
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
      const [
        res, 
        res1, 
        statsData,
      ] = await Promise.all([
        getKnowledgebaseList(),
        getCourseList(),
        getQuestionSum(userInfo.uid)

      ]);
      console.log(res)
      console.log(res1)
      setCourseOptions(res1.data.data)
      setKnowledgeList(res.data.data) 
      setStats( statsData.data.data)
  } catch (error) {
    message.error('保存失败，请重试！');
  } 

  }
useEffect( () => {
  getBaseList();
}, []);
  return (
    <div className={styles.exerciseContainer}>
       {/* Head部分 */}
      <div className={styles.head}>
        <h>智能习题生成系统</h>
        <p>基于人工智能的智能习题生成平台，助力教学提质增效</p>
      </div>

      {/* Top部分：数据统计和优秀题目展示 */}
      <div className={styles.top}>
        <div className={styles.statsSection}>
          <Card className={styles.statsCard}>
            <div className={styles.statsGrid}>
              {statConfigs.map(config => (
                <div key={config.key} className={styles.statItem} style={{'--stat-color': config.color}}>
                  <div className={styles.itemData}  style={{background:config.color}}> 
                    <h>{config.title}</h>
                    <p>{config.icon}  {stats[config.key]}</p>
                  </div>
                  <div className={styles.trend}>{config.trend}</div>
                  <div className={styles.wave}>
                    <div className={styles.waveItem}></div>
                    <div className={styles.waveItem}></div>
                    <div className={styles.waveItem}></div>
                    <div className={styles.waveItem}></div>
                    <div className={styles.waveItem}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className={styles.showcaseSection}>
           <div className={styles.historySection}>
          <Card title="生成历史" className={styles.historyCard}>
            <Timeline items={timelineItems} />
          </Card>
        </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.leftSection}>
          <div className={styles.generateCard}>
            <div className={styles.formHeader}>
              <h2>习题生成</h2>
            </div>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerate}
              className={styles.generateForm}
            >
              <div className={styles.formSection}>
                <div className={styles.sectionTitle}>
                  <FileTextOutlined />
                  <span>基本信息</span>
                </div>
                <Form.Item
                  name="type"
                  label="习题类型"
                  rules={[{ required: true, message: '请选择习题类型' }]}
                >
                  <Select 
                    onChange={(value) => setSelectedType(value)}
                    className={styles.customSelect}
                  >
                    <Option value="单选题">
                      <Space>
                        <CheckCircleOutlined />
                        单选题
                      </Space>
                    </Option>
                    <Option value="多选题">
                      <Space>
                        <CalculatorOutlined />
                        多选题
                      </Space>
                    </Option>
                    <Option value="判断题">
                      <Space>
                        <ReadOutlined />
                        判断题
                      </Space>
                    </Option>
                     <Option value="填空题">
                      <Space>
                        <CalculatorOutlined />
                        填空题
                      </Space>
                    </Option>
                     <Option value="简答题">
                      <Space>
                        <CalculatorOutlined />
                        简答题
                      </Space>
                    </Option>
                  </Select>
                </Form.Item>
  
                <Form.Item
                  name="subject"
                  label="学科"
                  rules={[{ required: true, message: '请选择学科' }]}
                >
                 <Input ></Input>
                </Form.Item>
  
                <Form.Item
                  name="difficulty"
                  label="难度"
                  rules={[{ required: true, message: '请选择难度' }]}
                >
                  <Select className={styles.customSelect}>
                     <Option value={1}>
                      <Space>
                        <Tag color="success">极易</Tag>
                      </Space>
                    </Option>
                    <Option value={2}>
                      <Space>
                        <Tag color="success">简单</Tag>
                      </Space>
                    </Option>
                    <Option value={3}>
                      <Space>
                        <Tag color="warning">中等</Tag>
                      </Space>
                    </Option>
                    <Option value={4}>
                      <Space>
                        <Tag color="error">困难</Tag>
                      </Space>
                    </Option>
                    <Option value={5}>
                      <Space>
                        <Tag color="error">极难</Tag>
                      </Space>
                    </Option>
                  </Select>
                </Form.Item>
              </div>
              <div className={styles.formSection}>
                <div className={styles.sectionTitle}>
                  <SettingOutlined />
                  <span>生成设置</span>
                </div>
                <Form.Item
                  label="文件上传"
                  rules={[{ required: true, message: '请输入习题要求' }]}
                >
                  <Upload.Dragger /* {...uploadProps} */>
                    <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                  </Upload.Dragger>
                </Form.Item>
                <Form.Item
                  label="选择课程和知识库"
                  rules={[{ required: true, message: '请输入习题要求' }]}
                >
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
                  
                </Form.Item>
                <Form.Item
                  name="count"
                  label="生成数量"
                  rules={[{ required: true, message: '请输入生成数量' }]}
                >
                  <InputNumber 
                    min={1} 
                    max={50} 
                    className={styles.customInput}
                    addonBefore={<NumberOutlined />}
                  />
                </Form.Item>  
                <Form.Item
                  name="description"
                  label="习题要求"
                  rules={[{ required: true, message: '请输入习题要求' }]}
                >
                  <TextArea 
                    rows={4} 
                    placeholder="请详细描述习题要求，例如：知识点、考察重点等"
                    className={styles.customTextarea}
                  />
                </Form.Item>
              </div>
              <Form.Item className={styles.submitItem}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<PlayCircleOutlined />}
                  loading={generating}
                  block
                  className={styles.submitButton}
                >
                  生成习题
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
        <div className={styles.rightSection}>
          <div className={styles.rightCard}>
            <div className={styles.tabButtons}>
              <Button
                type={activeTab === 'current' ? 'primary' : 'default'}
                icon={<FileSearchOutlined />}
                onClick={() => handleTabChange('current')}
              >
                当前生成
              </Button>
              <Button
                type={activeTab === 'history' ? 'primary' : 'default'}
                icon={<HistoryOutlined />}
                onClick={() => {handleTabChange('history');fetchData()}}
              >
                生成历史
              </Button>
            </div>
            {/* 数据板，仅在历史tab显示 */}
            {activeTab === 'history' && (
              <div className={styles.dataBoard}>
                <div className={styles.dataCard}>
                  <div className={styles.dataTitle}>题目总数</div>
                  <div className={styles.dataValue}>{stats?.resourceSum}</div>
                </div>
                <div className={styles.dataCard}>
                  <div className={styles.dataTitle}>标签占比</div>
                  <div className={styles.dataTags}>
                    {Object.entries(tagCount).map(([tag, count]) => (
                      <Tag color="cyan" key={tag}>{tag} {((count/tagTotal*100)||0).toFixed(0)}%</Tag>
                    ))}
                  </div>
                </div>
                <div className={styles.dataCard}>
                  <div className={styles.dataTitle}>题型分布</div>
                  <div className={styles.dataTags}>
                    {Object.entries(typeCount).map(([type, count]) => (
                      <Tag color="blue" key={type}>{type} {count}</Tag>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <ExerciseContent
              activeTab={activeTab}
              mockData={mockData}
              columns={columns}
              markdownData={markdownData}
              parsedQuestions={parsedQuestions}
              setIsSaveModalOpen={setIsSaveModalOpen}
              onSaveQuestion={handleSaveQuestion}
              onEditQuestion={handleEditQuestion}
            />
          </div>
        </div>
      </div>
      <Modal
        title="习题预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {previewData && (
          <div className={styles.previewContent}>
            <h3>{previewData.title}</h3>
            <div className={styles.previewInfo}>
              <p>类型：{previewData.type}</p>
              <p>难度：{previewData.difficulty}</p>
              <p>学科：{previewData.subject}</p>
              <p>标签：{previewData.tags.join(', ')}</p>
              <p>创建时间：{previewData.createTime}</p>
            </div>
            <div className={styles.previewQuestion}>
              <h4>题目内容</h4>
              <p>这里是习题的具体内容...</p>
            </div>
          </div>
        )}
      </Modal>

      <div className={aiStyles.aiSolveSection}>
        <Card className={aiStyles.aiSolveCard} title={
          <div className={aiStyles.aiSolveTitle}>
            <RobotOutlined />
            <span>AI智能解题</span>
          </div>
        }>
          <div className={aiStyles.aiSolveLayout}>
            <div className={aiStyles.inputPanel}>
              <div className={aiStyles.solveActions}>
                <div className={aiStyles.solveStats}>
                  <div className={aiStyles.statItem}>
                    <CheckCircleOutlined />
                    <span>已解题数</span>
                    <p>128</p>
                  </div>
                  <div className={aiStyles.statItem}>
                    <ClockCircleOutlined />
                    <span>平均用时</span>
                    <p>3.5s</p>
                  </div>
                  <div className={aiStyles.statItem}>
                    <LikeOutlined />
                    <span>准确率</span>
                    <p>98%</p>
                  </div>
                </div>

              </div>

              <div className={aiStyles.inputTypeSelector}>
                <Radio.Group value={inputType} onChange={e => setInputType(e.target.value)}>
                  <Radio.Button value="image">
                    <FileImageOutlined /> 图片上传
                  </Radio.Button>
                  <Radio.Button value="document">
                    <FileTextOutlined /> 文档上传
                  </Radio.Button>
                  <Radio.Button value="text">
                    <EditOutlined /> 直接输入
                  </Radio.Button>
                </Radio.Group>
              </div>

              {inputType === 'image' && (
                <>
                  <div className={aiStyles.sectionTitle}>
                    <FileImageOutlined />
                    <span>上传题目图片</span>
                  </div>
                  <Upload  {...uploadProps} name="image" accept="image/*" className={aiStyles.docUploader}>
                    {imageUrl ? (
                      <img src={imageUrl} alt="题目" style={{ width: '100%' }} />
                    ) : (
                      <div className={aiStyles.upload} >
                        <Upload  className={aiStyles.uploader}>
                        </Upload>
                        <div className={aiStyles.uploaderContent}>
                          <FileImageOutlined theme="filled" size="40" className={aiStyles.uploadIcon} />
                          <p className={aiStyles.uploadText}>点击或拖拽文件到此处上传</p>
                          <p className={aiStyles.uploadHint}>支持 Word、PDF、TXT 格式，大小不超过10MB</p>
                        </div>
                      </div>
                      
                   )}
                 </Upload>
               </>
             )}

             {inputType === 'document' && (
               <>
                 <div className={aiStyles.sectionTitle}>
                    <FileImageOutlined />
                    <span>上传文档</span>
                  </div>
                  <Upload
                   {...uploadProps}
                    name="image"
                    className={aiStyles.docUploader}
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt="题目" style={{ width: '100%' }} />
                    ) : (
                      <div className={aiStyles.upload}>
                        <Upload className={aiStyles.uploader}>
                        </Upload>
                        <div className={aiStyles.uploaderContent}>
                          <FileImageOutlined theme="filled" size="40" className={aiStyles.uploadIcon} />
                          <p className={aiStyles.uploadText}>点击或拖拽文件到此处上传</p>
                          <p className={aiStyles.uploadHint}>支持 Word、PDF、TXT 格式，大小不超过10MB</p>
                        </div>
                      </div>
                      
                   )}
                 </Upload>
               </>
             )}

             {inputType === 'text' && (
               <>
                 <div className={aiStyles.sectionTitle}>
                   <EditOutlined />
                   <span>直接输入</span>
                 </div>
                 <Form.Item className={aiStyles.textInput}>
                   <TextArea
                     rows={4}
                     placeholder="直接输入题目文本..."
                     value={extractedText}
                     onChange={(e) => setExtractedText(e.target.value)}
                   />
                 </Form.Item>
               </>
             )}

              <div className={aiStyles.solveActions}>
                <Button
                  type="primary"
                  icon={<RobotOutlined />}
                  loading={aiSolving}
                  onClick={handleSolve}
                  className={aiStyles.solveButton}
                >
                  {inputType === 'text'?'开始解题':'开始提取'}
                </Button>
              </div>
            </div>

            <div className={aiStyles.resultPanel}>
              {inputType === 'document' && Array.isArray(solveData) ? (
                <div className={aiStyles.solutionBox}>
                  <div className={aiStyles.solutionHeader}>
                    <FileSearchOutlined />
                    <span>解题过程</span>
                    <div className={aiStyles.solutionActions}>
                      <Button type="text" icon={<CopyOutlined />}>复制</Button>
                      <Button type="text" icon={<DownloadOutlined />}>下载</Button>
                    </div>
                  </div>
                  <div className={aiStyles.solutionList}>
                    {solveData.map((item, idx) => (
                      <div key={item.id || idx} className={aiStyles.solutionCard}>
                        <div>
                          <div className={aiStyles.solutionQTitle}><b>题目{idx + 1}：</b>{item.question}</div>
                          {item.options && item.options.length > 0 && (
                            <ul className={aiStyles.solutionOptions}>
                              {item.options.map((opt, i) => (
                                <li key={i}>{opt.text || opt}</li>
                              ))}
                            </ul>
                          )}
                          <div className={aiStyles.solutionAnswer} style={{width:'100%'}}><b>答案：</b>{item.answer}</div>
                          <div className={aiStyles.solutionAnalysis} style={{width:'100%'}}><b>解析：</b>{item.analysis}</div>
                       </div>
                        
                        <div className={aiStyles.questionActions}>
                          <Button
                            className={aiStyles.saveBtn}
                            type="primary"
                            size="small"
                            onClick={() => {
                              handleSaveQuestion(item);
                            }}
                          >
                            保存
                          </Button>
                          <Button
                            className={aiStyles.editBtn}
                            type="default"
                            size="small"
                            onClick={() => message.info('编辑功能开发中...')}
                          >
                            修改
                          </Button>
                  </div>
                </div>
                    ))}
                    </div>
                    </div>
                
              ) : (
                <div className={aiStyles.solutionBox}>
                  <div className={aiStyles.solutionHeader}>
                    <FileSearchOutlined />
                    <span>解题过程</span>
                    <div className={aiStyles.solutionActions}>
                      <Button type="text" icon={<CopyOutlined />}>复制</Button>
                      <Button type="text" icon={<DownloadOutlined />}>下载</Button>
                    </div>
                  </div>
                  <div className={aiStyles.solutionContent}>
                    {/* 修正：去除每行行首空格，去除```markdown包裹，保证markdown语法生效 */}
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >{
                      solveMarkdownData
                        .replace(/```markdown[\r\n]?/, '')
                        .replace('</markdown>', '')
                        .replace(/```[\r\n]?$/, '')
                        .split('\n')
                        .map(line => line.trimStart())
                        .join('\n')
                    }</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
      
      {isSaveModalOpen && (
        <div className={styles.saveModalOverlay} onClick={() => setIsSaveModalOpen(false)}>
          <div className={styles.saveModalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>保存题目</h3>
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
                <div className={styles.text}>放入题目库</div>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>题目名称</label>
              <input
                type="text"
                name="name"
                value={saveFormData.name}
                onChange={handleInputChange}
                placeholder="请输入教案名称"
              />
            </div>
      
            <div className={styles.formGroup}>
              <label>题目备注</label>
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

      {isEditModalOpen && (
        <div className={styles.saveModalOverlay} onClick={() => setIsEditModalOpen(false)}>
          <div className={styles.saveModalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>编辑题目</h3>
              <button className={styles.closeButton} onClick={() => setIsEditModalOpen(false)}>
                <Close theme="outline" size="20" />
              </button>
            </div>
            <div className={styles.formGroup}>
              <label>题干</label>
              <input
                type="text"
                name="question"
                value={editFormData.question}
                onChange={handleEditInputChange}
                placeholder="请输入题干"
              />
            </div>
            <div className={styles.formGroup}>
              <label>选项</label>
              {editFormData.options && editFormData.options.map((opt, i) => (
                <div key={i} className={styles.optionEditRow}>
                  <input
                    type="text"
                    value={opt}
                    onChange={e => handleEditOptionChange(i, e.target.value)}
                    placeholder={`选项${String.fromCharCode(65 + i)}`}
                  />
                  <button className={styles.removeOptionBtn} onClick={() => handleRemoveOption(i)}>-</button>
                </div>
              ))}
              <button className={styles.addOptionBtn} onClick={handleAddOption}>添加选项</button>
            </div>
            <div className={styles.formGroup}>
              <label>答案</label>
              <input
                type="text"
                name="answer"
                value={editFormData.answer}
                onChange={handleEditInputChange}
                placeholder="请输入答案"
              />
            </div>
            <div className={styles.buttonGroup}>
              <button className={styles.cancelButton} onClick={() => setIsEditModalOpen(false)}>取消</button>
              <button className={styles.confirmButton} onClick={handleEditSave}>保存</button>
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
                        <div className={styles.knowledgeFiles}>使用人数：{item.useNumber}</div>
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
  );
};

export default Exercise;