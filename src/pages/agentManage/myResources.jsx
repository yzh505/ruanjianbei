import React, { useState,useEffect } from 'react';
import { Card, Timeline, Statistic, Typography, Progress, Badge, Button } from 'antd';
import {
  VideoCameraOutlined,
  FileTextOutlined,
  PictureOutlined,
  FormOutlined,
  FileOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  RiseOutlined,
  BellOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import styles from '../../scss/agentManage/myResources.module.scss';
import VideoRes from './myResources/videoRes';
import FlowChartRes from './myResources/flowChartRes';
import ExerciseRes from './myResources/exerciseRes';
import PPTRes from './myResources/PPTRes';
import TeacherPlanRes from './myResources/teacherPlanRes';
import Paper from './myResources/Paper'
import {getVideoResource,getVideoSum} from '../../api/video'
import {getTextSum,getPictureSum} from '../../api/courseware'
import { getQuestionSum,getExamsSum } from '../../api/exercise';
import { 
  BookOpen,
  FilePdf,
  Edit,
  Calendar,
  Mail
} from '@icon-park/react'
import { getGeneratedResourceList } from '../../api/courseware';
const { Title, Text } = Typography;

const MyResources = ({resource }) => {
  // 添加选中模块状态
  console.log(resource)
  const [selectedModule, setSelectedModule] = useState(resource);
  const userInfo =JSON.parse(localStorage.getItem('user')) ;
  const [moduleCards,settModuleCards] = useState([]);
  const [statistics,setStatistics] = useState({});
  const [weeklyContent,setWeeklyContent] = useState([
     { title: '第一章教案', type: 'ppt', date: '2024-03-21' },
     { title: 'java程序设计教案', type: 'plan', date: '2024-03-20' },
     { title: '计算机组成原理教案', type: 'schedule', date: '2024-03-19' },
     { title: '计算机组成原理PPT', type: 'schedule', date: '2024-03-19' }
   ]);
  const announcements = [
    { title: '新增AI智能分类功能', date: '2024-03-21' },
    { title: '资源管理系统更新v2.0', date: '2024-03-20' },
    { title: '新增50+教学模板', date: '2024-03-19' }
  ];
  // 返回选择界面
  const handleBack = () => {
    setSelectedModule('select');
  };

  const getBaseList =async ()=>{
    try{
      const [res,res1,res2,res3,res4,res5,weekCount]= await Promise.all([
        getVideoSum(userInfo.uid),
        getTextSum({userId:userInfo.uid,textType:'teachingplan'}),
        getTextSum({userId:userInfo.uid,textType:'ppt'}),
        getPictureSum(userInfo.uid),
        getQuestionSum(userInfo.uid),
        getExamsSum(userInfo.uid),
        getGeneratedResourceList(),
      ]);
      settModuleCards([
        { 
          title: '我的视频', 
          label: '视频资源',
          icon: <VideoCameraOutlined />, 
          count: res.data.data.resourceSum,
          color: '#1890ff',
          colorRgb: '24, 144, 255',
          description: '课程视频、教学录像等多媒体资源',
          id: 'video'
        },
        { 
          title: '我的PPT', 
          label: 'PPT资源',
          icon: <FileTextOutlined />, 
          count: res2.data.data.resourceSum,
          color: '#722ed1',
          colorRgb: '114, 46, 209',
          description: '课件、教学演示文稿等教学资源',
          id: 'PPT'
        },
        { 
          title: '我的教案', 
          label: '教案资源',
          icon: <FileOutlined />, 
          count: res1.data.data.resourceSum,
          color: '#52c41a',
          colorRgb: '82, 196, 26',
          description: '教学计划、教案设计等文档资源',
          id: 'teacherPlan'
        },
        { 
          title: '我的图表', 
          label: '图表资源',
          icon: <PictureOutlined />, 
          count: res3.data.data.resourceSum,
          color: '#fa8c16',
          colorRgb: '250, 140, 22',
          description: '教学图示、示意图等图形资源',
          id: 'flowChart'
        },
        { 
          title: '我的习题', 
          label: '习题资源',
          icon: <FormOutlined />, 
          count: res4.data.data.resourceSum,
          color: '#eb2f96',
          colorRgb: '235, 47, 150',
          description: '练习题、测试题等考核资源',
          id: 'exercise'
        },
        { 
          title: '我的试卷', 
          label: '试卷资源',
          icon: <FormOutlined />, 
          count: res5.data.data.resourceSum,
          color: '#4ad8b9',
          colorRgb: '59, 210, 221',
          description: '试卷、测试等考核资源',
          id: 'paper'
        }
      ])
      setStatistics({
        totalResources: res.data.data.resourceSum + res1.data.data.resourceSum + res2.data.data.resourceSum + res3.data.data.resourceSum + res4.data.data.resourceSum + res5.data.data.resourceSum,
        monthSum: res.data.data.monthSum + res1.data.data.monthSum + res2.data.data.monthSum + res3.data.data.monthSum + res4.data.data.monthSum + res5.data.data.monthSum,
        weekSum: res.data.data.weekSum + res1.data.data.weekSum + res2.data.data.weekSum + res3.data.data.weekSum + res4.data.data.weekSum + res5.data.data.weekSum,
        daySum: res.data.data.daySum + res1.data.data.daySum + res2.data.data.daySum + res3.data.data.daySum + res4.data.data.daySum + res5.data.data.daySum
      })
      setWeeklyContent(weekCount.data.data);
    } catch (error) {
    } 

  }
useEffect( () => {
  getBaseList();
}, []);
  return (
    <>
      {selectedModule !== 'select' && (
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
          className={styles.backButton}
          onClick={handleBack}
        >
          返回
        </Button>
      )} 
      {/* 选择界面 */}
      {selectedModule === 'select'&&
        <div className={styles.resourcesContainer}>
          <div className={styles.select}>
            <div className={styles.headerSection}>
              <div className={styles.titleWrapper}>
                <Title level={2} className={styles.mainTitle}>我的资源管理</Title>
                <Text className={styles.subtitle}>
                  更高效的资源管理，让教学素材一目了然。智能分类、快速检索，助力教学工作更轻松。
                </Text>
              </div>
              <div className={styles.headerStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{statistics.totalResources}</span>
                  <span className={styles.statLabel}>总资源数</span>
                </div>
                <div className={styles.divider} />
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{statistics.monthSum}</span>
                  <span className={styles.statLabel}>本月新增</span>
                </div>
                <div className={styles.divider} />
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{statistics.weekSum}</span>
                  <span className={styles.statLabel}>本周新增</span>
                </div>
              </div>
            </div>
  
            <div className={styles.mainLayout}>
              <div className={styles.leftSection}>
                <div className={styles.moduleSection}>
                  <h3>资源模块</h3>
                  <div className={styles.dataBoard}>
                    {moduleCards.map((item, index) => (
                      <div 
                        key={index} 
                        className={styles.dataCard}
                        onClick={() => setSelectedModule(item.id)}
                        style={{ 
                          '--card-color': item.color,
                          '--card-color-rgb': item.colorRgb
                        }}
                      >
                        <div>
                          <div className={styles.cardHeader}>
                            <div className={styles.iconWrapper}>
                              {item.icon}
                            </div>
                            <div className={styles.cardTitle}>
                              <h4>{item.title}</h4>
                              <p>{item.label}</p>
                            </div>
                          </div>
                          <div className={styles.cardDescription}>
                            {item.description}
                          </div>
                        </div>
                        <div className={styles.cardCount}>
                          <Text strong>{item.count}</Text>
                          <Text type="secondary">个</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* 系统公告 */}
                <div className={styles.announcementSection}>
                  <h3>系统公告</h3>
                  <div className={styles.announcements}>
                    {announcements.map((item, index) => (
                      <div key={index} className={styles.announcementItem}>
                        <BellOutlined className={styles.announcementIcon} />
                        <span className={styles.announcementTitle}>{item.title}</span>
                        <span className={styles.announcementDate}>{item.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
    
              {/* 右侧部分 */}
              <div className={styles.rightSection}>
                {/* 最近活动 */}
                <div className={styles.recentSection}>
                  <h3>最近活动</h3>
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
    
                {/* 资源统计 */}
                <div className={styles.statsSection}>
                  <h3>资源统计</h3>
                  <div className={styles.statsGrid}>
                    {[
                      { title: '总资源数', value: statistics.totalResources, color: '#1890ff' },
                      { title: '本月新增', value: statistics.monthSum, color: '#52c41a' },
                      { title: '本周新增', value: statistics.weekSum, color: '#722ed1' },
                      { title: '今日新增', value: statistics.daySum, color: '#fa8c16' }
                    ].map((stat, index) => (
                      <div key={index} className={styles.statItem}>
                        <Text type="secondary">{stat.title}</Text>
                        <Text strong style={{ color: stat.color, fontSize: '24px' }}>
                          {stat.value}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
    </div>
      }
      {/* 各个模块的内容 */}
      {selectedModule === 'video'&& <VideoRes/>}
      {selectedModule === 'PPT'&& <PPTRes/>}
      {selectedModule === 'teacherPlan'&& <TeacherPlanRes/>}
      {selectedModule === 'flowChart'&& <FlowChartRes/>}
      {selectedModule === 'exercise'&& <ExerciseRes/>}
      {selectedModule === 'paper'&& <Paper/>}
    </>
   
  );
};

export default MyResources; 