import React, { useState } from 'react';
import { 
  Upload, Button, message, Input, Select, Form, Modal, Steps,
  Card, Typography, Popconfirm, Tooltip, DatePicker, Pagination
} from 'antd';
import {FolderPlus, Close} from '@icon-park/react';
import {
  UploadOutlined,
  DeleteOutlined,
  FileTextOutlined,
  BookOutlined,
  EditOutlined,
  FileOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ProjectOutlined,
  TeamOutlined,
  RocketOutlined,
  FileSearchOutlined,
  PlusOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  AimOutlined,
  ReadOutlined,
  ScheduleOutlined,
  TrophyOutlined,
  CaretDownOutlined,
  CaretRightOutlined
} from '@ant-design/icons';
import styles from '../../scss/courseDesign/courseDesign.module.scss';
import {getDirectory,generateTask} from '../../api/coursedesign'
import {uploadFile} from '../../api/user'
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Step } = Steps;
const { RangePicker } = DatePicker;

const CourseDesign = () => {
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [courseDesign, setCourseDesign] = useState(null);
  const [fileUrl,setFileUrl]=useState('')
  const [expandedChapters, setExpandedChapters] = useState({});
  const [totalWeeks, setTotalWeeks] = useState(0);
  const [editingRow, setEditingRow] = useState(null);
  const [editRowData, setEditRowData] = useState({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [historyList, setHistoryList] = useState([
    { id: 1, name: 'Java程序设计', date: '2024-07-01', desc: 'Java基础课程设计', tags: ['编程', 'Java'], hours: 48, weeks: 16, createdAt: '2024-06-20 10:00' },
    { id: 2, name: 'Python数据分析', date: '2024-06-25', desc: '数据分析与可视化', tags: ['数据', 'Python'], hours: 32, weeks: 12, createdAt: '2024-06-10 09:30' },
    { id: 3, name: 'Web前端开发', date: '2024-06-20', desc: 'HTML/CSS/JS综合实践', tags: ['前端', 'Web'], hours: 40, weeks: 14, createdAt: '2024-06-01 14:20' },
    { id: 4, name: '数据库原理', date: '2024-06-15', desc: 'MySQL数据库设计', tags: ['数据库'], hours: 36, weeks: 12, createdAt: '2024-05-28 11:10' },
    { id: 5, name: '操作系统', date: '2024-06-10', desc: '进程与内存管理', tags: ['系统'], hours: 28, weeks: 10, createdAt: '2024-05-20 16:00' },
    { id: 6, name: '计算机网络', date: '2024-06-05', desc: '网络协议与安全', tags: ['网络'], hours: 30, weeks: 10, createdAt: '2024-05-15 13:40' },
    { id: 7, name: '人工智能导论', date: '2024-06-01', desc: 'AI基础与应用', tags: ['AI'], hours: 24, weeks: 8, createdAt: '2024-05-10 09:00' },
    { id: 8, name: '软件工程', date: '2024-05-28', desc: '项目管理与开发流程', tags: ['工程'], hours: 32, weeks: 12, createdAt: '2024-05-01 15:30' },
    { id: 9, name: 'C语言程序设计', date: '2024-05-20', desc: 'C语言基础', tags: ['编程', 'C语言'], hours: 30, weeks: 10, createdAt: '2024-04-28 10:10' },
    { id: 10, name: '数据结构', date: '2024-05-15', desc: '线性表与树', tags: ['算法'], hours: 36, weeks: 12, createdAt: '2024-04-20 08:50' },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const pagedHistory = historyList.slice((currentPage-1)*pageSize, currentPage*pageSize);

  // 添加展开/收起状态管理
  const toggleChapter = (chapterNumber) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterNumber]: !prev[chapterNumber]
    }));
  };

  // 计算总周数函数
  const calculateWeeks = (start, end) => {
    if (!start || !end) return 0;
    let s = dayjs(start).startOf('day');
    let e = dayjs(end).startOf('day');
    let days = e.diff(s, 'day') + 1;
    let sundays = 0;
    for (let i = 0; i < days; i++) {
      if (s.add(i, 'day').day() === 0) sundays++;
    }
    // 如果最后一天是周一，且不是同一天，则再加一周
    let lastIsMonday = e.day() === 1 && days > 1;
    let weeks = sundays + (lastIsMonday ? 1 : 0);
    // 如果没有周日但有天数，也算一周
    if (weeks === 0 && days > 0) weeks = 1;
    return weeks;
  };

  // 监听课程周期变化
  const handlePeriodChange = (dates) => {
    if (dates && dates.length === 2) {
      setTotalWeeks(calculateWeeks(dates[0], dates[1]));
    } else {
      setTotalWeeks(0);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
   customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const fileData= new FormData();
        fileData.append('file',file);
        const res= await uploadFile(fileData);
        console.log(res.data.data.fileUrl);
        setFileUrl(res.data.data.fileUrl)
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
  // 数据面板统计
  const stats = {
    total: 128,
    generated: 45,
    inProgress: 12,
    completed: 71
  };

  // 删除文件
  const handleDelete = (file) => {
    const newFileList = fileList.filter(item => item.uid !== file.uid);
    setFileList(newFileList);
    message.success('文件已删除');
  };

  // 开始生成课程设计
  const handleStartGenerate = async () => {
    if(fileUrl===''){
      message.error('请先上传文件');
      return
    }
    const values = await form.validateFields();
    setModalVisible(true);
    setCurrentStep(0);
    startGenerateDesign();
  };

  // 生成课程设计
  const startGenerateDesign = async () => {
    setGenerating(true);
    try {
      const values = await form.validateFields();
      console.log(values)
      const res = await generateTask({
          "courseName": values.courseName,
          "materialsUrl": fileUrl,
          "classTime": values.totalHours,
          "startTime": values.coursePeriod[0],
          "endTime": values.coursePeriod[1],
          "weekNumber": totalWeeks
      });
      setCourseDesign(res.data.data)
      console.log(res.data.data);
      message.success('课程设计生成成功！');
    } catch (error) {
      message.error('生成失败，请重试');
    } finally {
      setModalVisible(false);
      setGenerating(false); // 保证无论如何都重置
    }
  };

  // 处理返回目录
  const handleBackToCatalog = () => {
    // 不再需要这个函数，但为了保持其他功能正常，我们保留空函数
  };

  const handleEditRow = (idx) => {
    setEditingRow(idx);
    setEditRowData({ ...courseDesign.teachingDevise[idx] });
    setEditModalVisible(true);
  };
  const handleEditChange = (field, value) => {
    setEditRowData(prev => ({ ...prev, [field]: value }));
  };
  const handleSaveRow = () => {
    const newDevise = [...courseDesign.teachingDevise];
    newDevise[editingRow] = { ...editRowData };
    setCourseDesign(prev => ({ ...prev, teachingDevise: newDevise }));
    setEditModalVisible(false);
    setEditingRow(null);
  };
  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setEditingRow(null);
  };

  // 添加保存课程设计的函数
  const handleSaveCourseDesign = async () => {
    if (!courseDesign) return;
    setSaving(true);
    try {
      // TODO: 调用保存API
      message.success('课程设计保存成功！');
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };


  // 步骤内容
  const stepContent = () => {
    if (generating) {
      return (
        <div className={styles.stepResult}>
          <LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <p className={styles.resultText}>
            正在生成课程设计...
          </p>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className={styles.stepResult}>
          <CheckCircleOutlined className={styles.successIcon} />
          <p className={styles.resultText}>
            课程设计生成成功！
          </p>
          <p className={styles.resultHint}>
            点击完成查看完整课程设计
          </p>
        </div>
      );
    }

    return null;
  };

  // 渲染课程设计内容
  const renderDesignContent = () => {
    return (
      <div className={styles.designContent}>
      
        <div className={styles.contentSection}>
         
          {/* 新增教学安排表格 */}
          {courseDesign.teachingDevise && (
            <div className={styles.contentBlock}>
              <div className={styles.blockTitle}>详细教学安排</div>
              <div className={styles.teachingDeviseTable}>
                <table>
                  <thead>
                    <tr>
                      <th>周次</th>
                      <th>教学单元</th>
                      <th>教学内容</th>
                      <th>教学资源</th>
                      <th>课时</th>
                      <th>教学目标</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseDesign.teachingDevise.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.week}</td>
                        <td>{row.teachingUnit}</td>
                        <td>{row.teachingContent}</td>
                        <td>{row.teachingResources}</td>
                        <td>{row.classTime}</td>
                        <td>{row.teachingTarget}</td>
                        <td>
                          <Button size="small" onClick={() => handleEditRow(idx)}>编辑</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Modal
                title="编辑教学安排"
                open={editModalVisible}
                onCancel={handleCancelEdit}
                onOk={handleSaveRow}
                okText="保存"
                cancelText="取消"
                destroyOnClose
              >
                <Form layout="vertical">
                  <Form.Item label="周次">
                    <Input value={editRowData.week} onChange={e => handleEditChange('week', e.target.value)} />
                  </Form.Item>
                  <Form.Item label="教学单元">
                    <Input value={editRowData.teachingUnit} onChange={e => handleEditChange('teachingUnit', e.target.value)} />
                  </Form.Item>
                  <Form.Item label="教学内容">
                    <Input.TextArea value={editRowData.teachingContent} onChange={e => handleEditChange('teachingContent', e.target.value)} />
                  </Form.Item>
                  <Form.Item label="教学资源">
                    <Input value={editRowData.teachingResources} onChange={e => handleEditChange('teachingResources', e.target.value)} />
                  </Form.Item>
                  <Form.Item label="课时">
                    <Input value={editRowData.classTime} onChange={e => handleEditChange('classTime', e.target.value)} />
                  </Form.Item>
                  <Form.Item label="教学目标">
                    <Input.TextArea value={editRowData.teachingTarget} onChange={e => handleEditChange('teachingTarget', e.target.value)} />
                  </Form.Item>
                </Form>
              </Modal>
            </div>
          )}
        </div>
      </div>
    );
  };
   const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
   const [saveFormData, setSaveFormData] = useState({
     course: 'teachingplan',
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
   const [currentCourse,setCurrentCourse]=useState(null)
   const handleSaveSubmit = async () => {
       setIsSaving(true);
       try {
         // 这里添加实际的保存逻辑
        /*  const res = await  */
         setIsSaveModalOpen(false);
         message.success('保存成功')
       } catch (error) {
         message.error('保存失败，请重试！');
       } finally {
         setIsSaving(false);
       }
   };
  return (
    <div className={styles.exerciseContainer}>
      <div className={styles.head}>
        <h1>智能课程设计系统</h1>
        <p>基于人工智能的智能课程设计生成平台，助力教学提质增效</p>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.leftSection}>
          <div className={styles.uploadSection}>
            <div className={styles.sectionTitle}>
              <div>
                <UploadOutlined className={styles.icon} />
                <span>课程资料上传</span>
              </div>
                
            </div>
            <div className={styles.uploadArea}>
              <Upload
                {...uploadProps}
              >
                <Button icon={<UploadOutlined />} className={styles.uploadButton}>
                  点击上传文件
                </Button>
                <p className={styles.uploadHint}>支持 PDF、Word、PPT 等格式文件</p>
              </Upload>
            </div>

            <div className={styles.fileList}>
              {fileList.map(file => (
                <div key={file.uid} className={styles.fileItem}>
                  <FileOutlined className={styles.fileIcon} />
                  <div className={styles.fileInfo}>
                    <div className={styles.fileName}>{file.name}</div>
                    <div className={styles.fileSize}>{file.size} bytes</div>
                  </div>
                  <DeleteOutlined
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(file)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.inputSection}>
            <div className={styles.sectionTitle}>
              <div>
                <BookOutlined className={styles.icon} />
                <span>课程基本信息</span>
              </div>
              
            </div>
            <Form form={form} layout="vertical">
              <div className={styles.formGrid}>
                <div className={styles.formItem}>
                  <div className={styles.label}>
                    <ReadOutlined className={styles.labelIcon} />
                    课程名称
                  </div>
                  <Form.Item name="courseName" rules={[{ required: true, message: '请输入课程名称' }]}>
                    <Input 
                      placeholder="请输入课程名称" 
                      className={styles.customInput}
                    />
                  </Form.Item>
                </div>

                <div className={styles.formItem}>
                  <div className={styles.label}>
                    <ClockCircleOutlined className={styles.labelIcon} />
                    课程总课时
                  </div>
                  <Form.Item name="totalHours" rules={[{ required: true, message: '请输入课程总课时' }]}>
                    <Input 
                      type="number" 
                      min={1} 
                      placeholder="请输入课程总课时" 
                      addonAfter="课时"
                      className={styles.customInput}
                    />
                  </Form.Item>
                </div>

                <div className={`${styles.formItem} ${styles.fullWidth}`}>
                  <div className={styles.label}>
                    <CalendarOutlined className={styles.labelIcon} />
                    课程周期
                  </div>
                  <Form.Item 
                    name="coursePeriod" 
                    rules={[{ required: true, message: '请选择课程周期' }]}
                    className={styles.datePickerFormItem}
                  >
                    <RangePicker 
                      style={{ width: '100%' }}
                      placeholder={['开始日期', '结束日期']}
                      format="YYYY-MM-DD"
                      separator={
                        <div className={styles.datePickerSeparator}>
                          <div className={styles.line}></div>
                          <span>至</span>
                          <div className={styles.line}></div>
                        </div>
                      }
                      suffixIcon={<CalendarOutlined />}
                      popupClassName={styles.datePickerDropdown}
                      onChange={handlePeriodChange}
                    />
                  </Form.Item>
                  {totalWeeks > 0 && (
                    <div style={{ margin: '8px 0 0 0', color: '#1890ff', fontWeight: 500 }}>
                      总周数：{totalWeeks} 周
                    </div>
                  )}
                </div>

                <div className={`${styles.formItem} ${styles.fullWidth}`}>
                  <div className={styles.label}>
                    <AimOutlined className={styles.labelIcon} />
                    课程目标
                  </div>
                  <Form.Item name="courseObjective" rules={[{ required: true, message: '请输入课程目标' }]}>
                    <Input.TextArea 
                      rows={4} 
                      placeholder="请输入课程目标，例如：通过本课程学习，学生将掌握..."
                      className={styles.customTextArea}
                    />
                  </Form.Item>
                </div>
            
                <div className={styles.actionButtons}>
                  <Button 
                    type="primary" 
                    onClick={handleStartGenerate}
                    icon={<BookOutlined />}
                    className={styles.generateButton}
                  >
                    生成课程设计
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.sectionTitle}>
            <div className={styles.titleText}>
              <ProjectOutlined className={styles.icon} />
              <span>课程设计预览</span>
            </div>
            {courseDesign && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => setIsSaveModalOpen(true)}
                loading={saving}
                className={styles.saveButton}
              >
                保存课程设计
              </Button>
            )}
          </div>

          {courseDesign ? (
            renderDesignContent()
          ) : (
            <div className={styles.emptyContent}>
              <FileSearchOutlined className={styles.emptyIcon} />
              <div className={styles.emptyText}>暂无课程设计，请先生成</div>
            </div>
          )}
        </div>
      </div>

      <Modal
        title="生成课程设计"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={currentStep === 1 ? [
          <Button key="complete" type="primary" onClick={() => {
            setModalVisible(false);
            setCurrentStep(0);
          }}>
            完成
          </Button>
        ] : null}
        className={styles.stepModal}
        width={600}
      >
        <Steps current={currentStep}>
          <Step title="生成设计" icon={<BookOutlined />} />
          <Step title="完成" icon={<CheckCircleOutlined />} />
        </Steps>
        <div className={styles.stepContent}>
          {stepContent()}
        </div>
      </Modal>
       {isSaveModalOpen && (
          <div className={styles.saveModalOverlay} onClick={() => setIsSaveModalOpen(false)}>
            <div className={styles.saveModalContent} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>保存课程设计</h3>
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
                  <div className={styles.text}>放入课程列表</div>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>课程名称</label>
                <input
                  type="text"
                  name="name"
                  value={saveFormData.name}
                  onChange={handleInputChange}
                  placeholder="请输入教案名称"
                />
              </div>
  
              <div className={styles.formGroup}>
                <label>课程备注</label>
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

export default CourseDesign;