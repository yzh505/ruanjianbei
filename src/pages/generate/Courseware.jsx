import React, { useState, useEffect } from 'react';
import { Card, Tabs, message, Space, Badge } from 'antd';
import ReactECharts from 'echarts-for-react';
import {
  FileTextOutlined,
  EditOutlined,
  PlayCircleOutlined,
  BellOutlined
} from '@ant-design/icons';
import { 
  BookOpen,
  FilePdf,
  Edit,
  Calendar,
  Mail
} from '@icon-park/react'
import styles from '../../scss/generate/courseware.module.scss';
import PPT from './PPT/PPT'; 
import TeacherPlan from './PPT/teacherPlan';
import FlowChart from './PPT/flowChart';
import Papers from './PPT/Paper'
import ResourceTrendChart from './ResourceTrendChart';
import { getGeneratedResourceList } from '../../api/courseware';
import { getResourceList } from '../../api/analyis';
const { TabPane } = Tabs;

const Courseware = () => {
  const [selectedModule, setSelectedModule] = useState('Module');
  const [activePreviewTab, setActivePreviewTab] = useState('ppt');
  
  // 模块数据
  const stats = [
    { 
      label: 'PPT智能生成', 
      value: '智能PPT', 
      icon: <FilePdf theme="outline" size="24"/>,
      description: '一键生成精美的教学PPT，支持多种模板和风格',
      id: 'PPT',
      color: '#1890ff',
      colorRgb: '24, 144, 255'
    },
    { 
      label: '教案生成助手', 
      value: '智能教案', 
      icon: <Edit theme="outline" size="24"/>,
      description: '快速生成标准教案，包含教学目标、重难点分析等',
      id: 'teacherPlan',
      color: '#722ed1',
      colorRgb: '114, 46, 209'
    },
    { 
      label: '流程图制作', 
      value: '图表制作', 
      icon: <BookOpen theme="outline" size="24"/>,
      description: '基于AI的智能流程图生成系统，支持多种图型。',
      id: 'flowChart',
      color: '#52c41a',
      colorRgb: '82, 196, 26'
    },
    { 
      label: '试卷生成助手', 
      value: '试卷生成', 
      icon: <Calendar theme="outline" size="24"/>,
      description: '智能规划课程内容，合理安排教学进度',
      id: 'Paper',
      color: '#fa8c16',
      colorRgb: '250, 140, 22'
    }
  ];

  // 流程中心数据
  const workflowData = {
    todo: [
      { title: '待审核PPT课件', date: '2024-03-21' },
      { title: '待完成教案', date: '2024-03-22' }
    ],
    done: [
      { title: '已完成物理课PPT', date: '2024-03-20' },
      { title: '已审核数学教案', date: '2024-03-19' }
    ]
  };

  // 系统公告数据
  const announcements = [
    { title: '新功能上线：AI智能批改系统', date: '2024-03-21' },
    { title: '系统更新：新增50+PPT模板', date: '2024-03-20' },
    { title: '教育部最新课改方案解读', date: '2024-03-19' }
  ];

  // 本周生成内容
  const [weeklyContent,setWeeklyContent] = useState([
    { title: '第一章教案', type: 'ppt', date: '2024-03-21' },
    { title: 'java程序设计教案', type: 'plan', date: '2024-03-20' },
    { title: '计算机组成原理教案', type: 'schedule', date: '2024-03-19' },
    { title: '计算机组成原理PPT', type: 'schedule', date: '2024-03-19' }
  ]);

  // 邮件数据
  const emails = [
    { title: '关于教研组会议安排', from: '教务处', date: '2024-03-21', unread: true },
    { title: '课件审核反馈', from: '张主任', date: '2024-03-20', unread: false },
    { title: '新课标培训通知', from: '系统管理员', date: '2024-03-19', unread: true }
  ];
  const [data, setData] = useState({});
  const fetchData =async () => {
    try{
      const [
        res,
        res1
      ] = await Promise.all([
        getGeneratedResourceList(),
        getResourceList({
          cycleTime:'ONE_MONTH',
          courseid:8
        })
      ]);
      setWeeklyContent(res.data.data);
      setData(res1.data.data);
    } catch (error) {
      message.error('保存失败，请重试！');
    } 
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      {selectedModule !== 'Module' && (
        <button onClick={() => setSelectedModule('Module')} className={styles.back}>
          返回
        </button>
      )}
      {selectedModule === 'Module' && (
        <div className={styles.coursewareContainer}>
          <div className={styles.mainLayout}>
            {/* 左侧部分 */}
            <div className={styles.leftSection}>
              {/* 模块选择区域 */}
              <div className={styles.moduleSection}>
                <h3>功能模块</h3>
                <div className={styles.dataBoard}>
                  {stats.map((item, index) => (
                    <div 
                      key={index} 
                      className={styles.dataCard} 
                      onClick={() => setSelectedModule(item.id)}
                      style={{ 
                        '--card-color': item.color,
                        '--card-color-rgb': item.colorRgb
                      }}
                    >
                      <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper}>
                          {item.icon}
                        </div>
                        <div className={styles.cardTitle}>
                          <h3>{item.value}</h3>
                          <p>{item.label}</p>
                        </div>
                      </div>
                      <div className={styles.cardDescription}>
                        {item.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.workflowSection}>
                {/* 资源统计与趋势展示 */}
                {(() => {
                  const resourceVariationVoList = [
                    { resourceType: "文本资源", firstWeekCount: 4, secondWeekCount: 4, thirdWeekCount: 0, fourthWeekCount: 0 },
                    { resourceType: "图片资源", firstWeekCount: 7, secondWeekCount: 0, thirdWeekCount: 0, fourthWeekCount: 0 },
                    { resourceType: "视频资源", firstWeekCount: 0, secondWeekCount: 0, thirdWeekCount: 0, fourthWeekCount: 0 }
                  ];
                  const resourceKnowledgePointList = [
                    "计算机组成", "指令系统", "网络通信", "数据流处理", "CPU", "系统运维", "计算机组成原理"
                  ];
                  return (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                      {/* 资源趋势图表 */}
                      <div style={{background: '#fff', borderRadius: '10px', padding: '18px 24px', boxShadow: '0 2px 8px rgba(24,144,255,0.08)'}}>
                        <div style={{fontSize: '15px', color: '#1890ff', fontWeight: 600, marginBottom: '12px'}}>近四周资源变化趋势</div>
                        <div style={{height: '220px'}}>
                          <ResourceTrendChart data={data?.resourceVariationVoList||[]} />
                        </div>
                      </div>
                      {/* 知识点分布 */}
                      <div style={{background: '#fff', borderRadius: '10px', padding: '18px 24px', boxShadow: '0 2px 8px rgba(24,144,255,0.08)'}}>
                        <div style={{fontSize: '15px', color: '#1890ff', fontWeight: 600, marginBottom: '12px'}}>知识点分布</div>
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '12px'}}>
                          {data?.resourceKnowledgePointList?.map((kp, idx) => (
                            <span key={idx} style={{background: '#e6f7ff', color: '#1890ff', borderRadius: '6px', padding: '6px 14px', fontSize: '14px', fontWeight: 500}}>{kp.trim()}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 右侧部分 */}
            <div className={styles.rightSection}>
              {/* 本周生成内容 */}
              <div className={styles.weeklyContent}>
                <h3>本周生成内容</h3>
                <div className={styles.contentList}>
                  {weeklyContent?.map((item, index) => {
                    let icon = null;
                    if (item.resourceType === 'picture') icon = <Calendar theme="outline" size="24" />;
                    else if (item.resourceType === 'teachingplan') icon = <Edit theme="outline" size="24" />;
                    else if (item.resourceType === 'ppt') icon = <FilePdf theme="outline" size="24" />;
                    else icon = <FileTextOutlined style={{fontSize: 24, color: '#1890ff'}} />;
                    return (
                      <div key={item.resourceId || index} className={styles.contentItem}>
                        <div className={styles.contentInfo}>
                          <div className={styles.contentType}>{icon}</div>
                          <div className={styles.contentDetails}>
                            <h4>{item.resourceName}</h4>
                            <span className={styles.contentDate}>{item.createTime?.split('T')[0]}</span>
                            {item.resourceIntroduction && (
                              <div style={{fontSize: '14px', color: '#888', marginTop: '6px'}}>{item.resourceIntroduction}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
      </div> )}
      {selectedModule === 'PPT' && <PPT />}
      {selectedModule === 'teacherPlan' && <TeacherPlan />}
      {selectedModule === 'flowChart' && <FlowChart />}
      {selectedModule === 'Paper' && <Papers />}
    </>
   
  );
};

export default Courseware;
