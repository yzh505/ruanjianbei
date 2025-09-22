import React, { useState, useRef, useEffect,useCallback } from 'react';
import { Button, Input, message, Select, List, Upload, Slider, Modal, Space, Timeline, Statistic, Row, Tag, Form, InputNumber, Divider, Collapse } from 'antd';
import mermaid from 'mermaid';
import { Canvg } from 'canvg';
import styles from '../../../scss/generate/PPT/flowChart.module.scss';
import { 
  FileTextOutlined, 
  CalculatorOutlined, 
  BookOutlined, 
  RocketOutlined, 
  LoadingOutlined, 
  ExperimentOutlined, 
  FunctionOutlined, 
  CheckCircleOutlined,
  GlobalOutlined,
  SettingOutlined,
  NumberOutlined,
  ReadOutlined,
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
  SaveOutlined
} from '@ant-design/icons';
import {FolderPlus, Close } from '@icon-park/react';
import {exams} from '../../../api/exercise'
import {uploadFile } from '../../../api/user'
import html2canvas from 'html2canvas';
import {getKnowledgebaseList}from '../../../api/knowledge'
import {AIRecommendExams}from '../../../api/exercise'
import {getCourseList} from '../../../api/coursedesign'
import paperStyles from '../../../scss/generate/PPT/Paper.module.scss'

const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

const Paper = () => {
  const [chartType, setChartType] = useState('Flowchart');
  const [mermaidCode, setMermaidCode] = useState('');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [paperData, setPaperData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveForm] = Form.useForm();
   const token = localStorage.getItem('accessToken');
  const [selectedType, setSelectedType] = useState('choice');
  const [generating, setGenerating] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem('user')) || {};
  // 渲染 mermaid 流程图
  const [currentValues,setVurrentValues]=useState(null)

 
    const handleGenerate = useCallback(async (values) => {
      setGenerating(true);
      try{
        setVurrentValues(values)
        const res = await AIRecommendExams(values);
        console.log(res.data.data)
        setMockPaperData(res.data.data)
        setGenerating(false);

      }catch(error){

      }
      console.log('生成习题参数:', values);
    }, [form]);

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
  const handleSaveSubmit = async () => {
        setIsSaving(true);
        try {
          const res= await exams({
              "title": saveFormData.name,
              "description": saveFormData.notes,
              "subject":currentValues.subject,
              "grade": saveFormData.grade,
              "questionCount":currentValues.questionDescription,
              "creatorId": userInfo.uid,
              "status": 0,
          })
          setIsSaving(false);
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
  const selectedKnowledgeObj = knowledgeList?.find(k => k.key === selectedKnowledge);
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
  const filteredCourseList = courseOptions?.filter(item =>
    item.courseName?.includes(courseSearch)
  );
  const selectedCourseObj = courseOptions?.find(c => c.courseId === selectedCourse);
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

const [mockPaperData,setMockPaperData] = useState();
  
  const handleSave = async () => {
   setIsSaveModalOpen(true)
  };

  const handleSaveConfirm = async () => {
    try {
      const values = await saveForm.validateFields();
      setSaving(true);
      // TODO: 调用保存API
      message.success('保存成功！');
      setSaveModalVisible(false);
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.flowChartContainer}>
        <div className={styles.title}>
          <h1>智能试卷生成助手</h1>
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
      {/* 生成部分 */}
      <div className={paperStyles.bottom}>
        <div className={paperStyles.leftSection}>
          <div className={paperStyles.generateCard}>
            <div className={paperStyles.formHeader}>
              <h2>试卷组成</h2>
            </div>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerate}
              className={paperStyles.generateForm}
            >
              <div className={paperStyles.formSection}>
                <div className={paperStyles.sectionTitle}>
                  <FileTextOutlined />
                  <span>基本信息</span>
                </div>
                <Form.Item
                  name="subject"
                  label="学科"
                  rules={[{ required: true, message: '请选择学科' }]}
                >
                  <Input></Input>
                </Form.Item>

                <Form.Item
                  name="knowledgePoints"
                  label="知识点"
                  rules={[{ required: false }]}
                >
                  <Select
                    mode="tags"
                    className={paperStyles.customSelect}
                    placeholder="输入或选择知识点，可自定义多个"
                    allowClear
                  />
                </Form.Item>

                <Form.Item
                  name="difficulty"
                  label="难度"
                  rules={[{ required: true, message: '请选择难度' }]}
                >
                  <Select className={paperStyles.customSelect}>
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
                <Form.Item
                  name="subject"
                  label="数量"
                  rules={[{ required: true, message: '请选择学科' }]}
                >
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Form.Item name="singleChoice" initialValue={0} style={{ marginLeft: '5px' }}>
                      <InputNumber 
                        min={0} 
                        max={50} 
                        className={paperStyles.customInput}
                        style={{ width: 140 }} 
                        addonBefore={'单选题'}
                      />
                    </Form.Item>
                    <Form.Item name="multipleChoice" initialValue={0} style={{ marginLeft: '10px' }}>
                      <InputNumber 
                        min={0} 
                        max={50} 
                        className={paperStyles.customInput}
                        style={{ width: 140 }} 
                        addonBefore={'多选题'}
                      />
                    </Form.Item>
                    <Form.Item name="fillInBlank"  initialValue={0} style={{ marginLeft: '5px' }}>
                      <InputNumber 
                        min={0} 
                        max={50} 
                        className={paperStyles.customInput}
                        style={{ width: 140 }} 
                        addonBefore={'填空题'}
                      />
                    </Form.Item>
                    <Form.Item name="judgment" initialValue={0} style={{ marginLeft: '10px' }}>
                      <InputNumber 
                        min={0} 
                        max={50} 
                        className={paperStyles.customInput}
                        style={{ width: 140 }} 
                        addonBefore={'判断题'}
                      />
                    </Form.Item>
                    <Form.Item name="shortAnswer" initialValue={0} style={{ marginLeft: '5px' }}>
                      <InputNumber 
                        min={0} 
                        max={50} 
                        className={paperStyles.customInput}
                        style={{ width: 140 }} 
                        addonBefore={'简答题'}
                      />
                    </Form.Item>
                  </div>
                </Form.Item>
              </div>
              <div className={paperStyles.formSection}>
                <div className={paperStyles.sectionTitle}>
                  <SettingOutlined />
                  <span>生成设置</span>
                </div>
                <Form.Item
                  name="subject"
                  label="选择课程和知识库"
                  rules={[{ required: true, message: '请选择学科' }]}
                >
                  <div className={paperStyles.selectPanel} style={{marginTop:'10px'}}>
                    {/* 知识库选择弹窗触发 */}
                    <div
                      className={paperStyles.knowledgeSelectBox}
                      onClick={() => setIsKnowledgeModalOpen(true)}
                      tabIndex={0}
                    >
                      {selectedKnowledgeObj ? (
                        <>
                          <div className={paperStyles.knowledgeTitle}>{selectedKnowledgeObj.knowledgebaseName}</div>
                        </>
                      ) : (
                        <span className={paperStyles.knowledgePlaceholder}>请选择知识库</span>
                      )}
                    </div>
                    {/* 课程选择弹窗触发 */}
                    <div
                      className={paperStyles.knowledgeSelectBox}
                      onClick={() => setIsCourseModalOpen(true)}
                      tabIndex={0}
                    >
                      {selectedCourseObj ? (
                        <>
                          <div className={paperStyles.knowledgeTitle}>{selectedCourseObj.courseName}</div>
                        </>
                      ) : (
                        <span className={paperStyles.knowledgePlaceholder}>请选择课程</span>
                      )}
                    </div>
                  </div>
                  
                </Form.Item>
              
                
                <Form.Item
                  name="questionDescription"
                  label="组卷要求"
                  rules={[{ required: true, message: '请输入习题要求' }]}
                >
                  <TextArea 
                    rows={4} 
                    placeholder="请详细描述习题要求，例如：知识点、考察重点等"
                    className={paperStyles.customTextarea}
                  />
                </Form.Item>
              </div>
              <Form.Item className={paperStyles.submitItem}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<PlayCircleOutlined />}
                  loading={generating}
                  block
                  className={paperStyles.submitButton}
                >
                  生成试卷
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
        <div className={paperStyles.rightSection}>
          <div className={paperStyles.rightCard}>
            <div className={paperStyles.formHeader}>
              <h2>试卷组成</h2>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={saving}
                className={paperStyles.saveButton}
              >
                保存试卷
              </Button>
            </div>
            <div className={paperStyles.Paper}>
              {mockPaperData?.map((q, idx) => (
                <React.Fragment key={q.id}>
                  <div className={paperStyles.questionBlock}>
                    <div className={paperStyles.questionHeader}>
                      <span className={paperStyles.questionIndex}>第{idx + 1}题</span>
                      <span className={paperStyles.typeTag}>{q.type}</span>
                      <span className={paperStyles.difficultyTag}>难度: {q.difficulty}</span>
                    </div>
                    <div className={paperStyles.questionText}>{q.question}</div>
                    {q.options && q.options.length > 0 && (
                      <ul className={paperStyles.optionsList}>
                        {q.options.map((opt, i) => (
                          <li key={i}>{opt.text}</li>
                        ))}
                      </ul>
                    )}
                    <div className={paperStyles.answerRow}><b>答案：</b>{q.answer}</div>
                    <Collapse bordered={false} className={paperStyles.analysisCollapse}>
                      <Panel header={<span style={{color:'#888'}}>点击展开解析</span>} key="1">
                        <div className={paperStyles.analysisRow}><b>解析：</b>{q.analysis}</div>
                      </Panel>
                    </Collapse>
                  </div>
                  {idx !== mockPaperData.length - 1 && <Divider className={paperStyles.questionDivider} />}
                </React.Fragment>
              ))}
            </div>
            
          </div>
        </div>
      </div>

      {isSaveModalOpen && (
        <div className={styles.saveModalOverlay} onClick={() => setIsSaveModalOpen(false)}>
          <div className={styles.saveModalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>保存试卷</h3>
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
                <div className={styles.text}>放入试卷库</div>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>试卷名称</label>
              <input
                type="text"
                name="name"
                value={saveFormData.name}
                onChange={handleInputChange}
                placeholder="请输入试卷名称"
              />
            </div>

            <div className={styles.formGroup}>
              <label>试卷备注</label>
              <textarea
                name="notes"
                value={saveFormData.notes}
                onChange={handleInputChange}
                placeholder="请输入试卷备注信息"
              />
            </div>
            <div className={styles.formGroup}>
              <label>试卷分数</label>
              <textarea
                name="grade"
                value={saveFormData.grade}
                onChange={handleInputChange}
                placeholder="请输入试卷备注信息"
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
    <Modal
        title="保存试卷"
        open={saveModalVisible}
        onCancel={() => setSaveModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={saveForm} layout="vertical">
          <Form.Item
            name="name"
            label="试卷名称"
            rules={[{ required: true, message: '请输入试卷名称' }]}
          >
            <Input placeholder="请输入试卷名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="试卷描述"
          >
            <Input.TextArea placeholder="请输入试卷描述（选填）" />
          </Form.Item>
          <Form.Item className={paperStyles.modalFooter}>
            <Button onClick={() => setSaveModalVisible(false)}>取消</Button>
            <Button type="primary" onClick={handleSaveConfirm} loading={saving}>
              确认保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Paper;
