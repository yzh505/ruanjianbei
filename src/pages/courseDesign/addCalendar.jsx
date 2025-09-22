import React, { useState, useEffect, useRef } from 'react';
import { Pagination, Button, Modal, Form, Input, DatePicker, TimePicker, Select, message, List, Tag, Tooltip, Progress, Divider } from 'antd';
import ReactECharts from 'echarts-for-react';
import {
  LeftOutlined,
  RightOutlined,
  PlusOutlined,
  BellOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  RiseOutlined,
  ScheduleOutlined,
  CheckCircleOutlined,
  BookOutlined,
  UserOutlined,
  ClockCircleOutlined as ClockIcon,
  TagOutlined,
  BulbOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import styles from '../../scss/courseDesign/addCalendar.module.scss';
import moment from 'moment';
import { getCourseList ,getCourseFeature,getCourseRadarmap,getCourseMessage,getRecommendResource,getCourseData} from '../../api/coursedesign';
import 'moment/locale/zh-cn';

moment.locale('zh-cn');

const AddCalendar = () => {
  const [currentDate, setCurrentDate] = useState(moment());
  const [isWeeklyModalVisible, setIsWeeklyModalVisible] = useState(false);
  const [isCourseDetailModalVisible, setIsCourseDetailModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [events, setEvents] = useState([
    {
      id: 1,
      title: '计算机组成原理PPT',
      date: moment().format('YYYY-MM-DD'),
      time: '09:00',
      type: 'important',
      description: '讨论新学期课程安排',
    },
    {
      id: 2,
      title: '软件工程导论PPT',
      date: moment().add(1, 'days').format('YYYY-MM-DD'),
      time: '14:30',
      type: 'normal',
      description: '教学进度同步',
    },
    {
      id: 3,
      title: '计算机组成原理PPT',
      date: moment().format('YYYY-MM-DD'),
      time: '15:00',
      type: 'important',
      description: '准备下周教案',
    },
    {
      id: 4,
      title: '计算机组成原理PPT',
      date: moment().subtract(1, 'days').format('YYYY-MM-DD'),
      time: '10:00',
      type: 'normal',
      description: '月度班会',
    },
    {
      id: 5,
      title: '计算机组成原理PPT',
      date: moment().add(2, 'days').format('YYYY-MM-DD'),
      time: '09:30',
      type: 'important',
      description: '观摩示范课',
    }
  ]);
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
  const pageSize = 4;

  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isDayModalVisible, setIsDayModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [form] = Form.useForm();
  const pagedHistory = historyList.slice((currentPage-1)*pageSize, currentPage*pageSize);

  // 统计数据
  const stats = {
    total: events.length,
    today: events.filter(e => moment(e.date).isSame(moment(), 'day')).length,
    upcoming: events.filter(e => moment(e.date).isAfter(moment())).length,
    completed: events.filter(e => moment(e.date).isBefore(moment(), 'day')).length
  };

  // 数据面板统计
  const [dataStats,setDataStats] = useState({
    totalCourses: historyList.length,
    weeklyNew: historyList.filter(item => 
      moment(item.createdAt).isAfter(moment().startOf('week'))
    ).length,
    frequentCourses: historyList.filter(item => 
      item.tags && item.tags.includes('常用')
    ).length,
    activeCourses: historyList.filter(item => 
      moment(item.endTime).isAfter(moment())
    ).length
  });

  // 生成本周日历数据
  const generateWeeklyCalendar = () => {
    const startOfWeek = moment().startOf('week');
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = moment(startOfWeek).add(i, 'days');
      const dayEvents = events.filter(e => moment(e.date).isSame(day, 'day'));
      
      days.push({
        date: day,
        events: dayEvents,
        isToday: day.isSame(moment(), 'day')
      });
    }
    
    return days;
  };

  // 显示本周日历弹窗
  const showWeeklyCalendar = () => {
    setIsWeeklyModalVisible(true);
  };


  // 处理删除事件
  const handleDeleteEvent = (eventId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个日程吗？',
      onOk: () => {
        setEvents(events.filter(e => e.id !== eventId));
        message.success('删除成功');
      }
    });
  };

  // 处理编辑事件
  const handleEditEvent = (event) => {
    setSelectedDate(moment(event.date));
    form.setFieldsValue({
      ...event,
      date: moment(event.date),
      time: moment(event.time, 'HH:mm')
    });
    setIsDayModalVisible(false);
    setIsAddModalVisible(true);
  };

  // 显示日程详情
  const showDayEvents = (date, dayEvents) => {
    setSelectedDate(date);
    setSelectedDayEvents(dayEvents);
    setIsDayModalVisible(true);
  };
  const [leiDaData,setleiDaData] = useState(null)
  // 推荐内容示例数据
  const [coursewareContents,setCourseware] = useState([
    {
        resourceName: "Java流程控制结构教案",
        resourceFeature: ["if语句", "switch语句", "条件判断"],
        resourceType: "教案"
    },
    {
        resourceName: "选择与循环结构PPT",
        resourceFeature: ["if-else", "switch-case", "流程控制"],
        resourceType: "PPT"
    },
    {
        resourceName: "循环结构教学图解",
        resourceFeature: ["while", "do-while", "for循环"],
        resourceType: "流程图"
    },
    {
        resourceName: "break与continue使用说明",
        resourceFeature: ["break语句", "continue语句", "循环控制"],
        resourceType: "图表"
    }
  ]);
  const [questionRecommends,setQuestion] = useState([
    {
        resourceName: "选择结构练习题",
        resourceFeature: ["if语句", "switch语句", "条件分支"],
        resourceType: "单选题"
    },
    {
        resourceName: "循环结构习题集",
        resourceFeature: ["while循环", "for循环", "do-while循环"],
        resourceType: "多选题"
    },
    {
        resourceName: "流程控制综合测试",
        resourceFeature: ["break", "continue", "嵌套结构"],
        resourceType: "填空题"
    },
    {
        resourceName: "Java流程控制编程题",
        resourceFeature: ["条件判断", "循环控制", "逻辑实现"],
        resourceType: "编程题"
    }
  ]);
  const [otherRecommends,setOther] = useState([
    {
        resourceName: "流程控制程序案例集",
        resourceFeature: ["if应用", "循环应用", "控制跳转"],
        resourceType: "案例"
    },
    {
        resourceName: "流程控制讲解视频",
        resourceFeature: ["if-else详解", "循环结构详解", "break/continue使用"],
        resourceType: "视频"
    },
    {
        resourceName: "Java流程控制思维导图",
        resourceFeature: ["选择结构", "循环结构", "控制语句"],
        resourceType: "思维导图"
    },
    {
        resourceName: "Java控制结构常见错误总结",
        resourceFeature: ["语法错误", "逻辑错误", "循环陷阱"],
        resourceType: "文本资源"
    }
  ]);
  // 显示课程详情
  const showCourseDetail = async (course) => {
    setSelectedCourse(course);
    setIsCourseDetailModalVisible(true);
    try{
        const [
          res, 
          res2,
        ] = await Promise.all([
          getCourseRadarmap(course.courseId),
          getCourseMessage(course.courseId),
        ]);
        setSelectedCourse(res2.data.data)
        setleiDaData(res.data.data)
        const res1=await getRecommendResource(course.courseId,calculateCurrentWeek(res2.data.data.startTime, res2.data.data.weekNumber))
        setCourseware(res1.data.data.coursewareContents)
        setQuestion(res1.data.data.questionRecommends)
        setOther(res1.data.data.otherRecommends)
    } catch (error) {
      message.error('保存失败，请重试！');
    } 
    
  };

  // 计算当前周数
  const calculateCurrentWeek = (startTime, weekNumber) => {
    if (!startTime) return 0;
    const start = moment(startTime);
    const now = moment();
    const weeksDiff = now.diff(start, 'weeks');
    return Math.max(0, Math.min(weeksDiff + 1, weekNumber));
  };

  // 计算课程进度
  const calculateCourseProgress = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const start = moment(startTime);
    const end = moment(endTime);
    const now = moment();
    
    if (now.isBefore(start)) return 0;
    if (now.isAfter(end)) return 100;
    
    const totalDuration = end.diff(start);
    const elapsed = now.diff(start);
    return Math.round((elapsed / totalDuration) * 100);
  };
  
  // 生成课程特征雷达图配置
  const generateRadarChartOptions = (course) => {
    if (!course) return {};
    
    // 计算课程特征维度
    const features = {
      '知识结构化': leiDaData?.knowledgePoint*20, // 20周为满分
      '方法工具性': leiDaData?.functionPoint*20, // 60课时为满分
      '逻辑推理度': leiDaData?.logicPoint*20, // 编程类课程实践性更高
      '实验依赖度': leiDaData?.experimentPoint*20,
      '计算负荷度': leiDaData?.computePoint*20,
      '创新前沿度': leiDaData?.innovationPoint*20,
      '交叉融合度': leiDaData?.fusionPoint*20,
      '社会应用度': leiDaData?.socialPoint*20
    };
    
    const indicators = Object.keys(features).map(key => ({
      name: key,
      max: 100
    }));
    
    const data = [{
      value: Object.values(features),
      name: '课程特征',
      areaStyle: {
        color: 'rgba(24, 144, 255, 0.2)'
      },
      lineStyle: {
        color: '#1890ff'
      },
      itemStyle: {
        color: '#1890ff'
      }
    }];
    
    return {
      title: {
        text: '课程特征分析',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 600,
          color: '#1a1a1a'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          const value = params.value[params.dataIndex];
          const name = indicators[params.dataIndex].name;
          return `${name}: ${value.toFixed(1)}`;
        }
      },
      radar: {
        indicator: indicators,
        radius: '65%',
        center: ['50%', '60%'],
        splitNumber: 4,
        axisName: {
          color: '#666',
          fontSize: 12
        },
        splitLine: {
          lineStyle: {
            color: '#e8e8e8'
          }
        },
        splitArea: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: '#e8e8e8'
          }
        }
      },
      series: [{
        type: 'radar',
        data: data,
        symbolSize: 6,
        lineStyle: {
          width: 2
        }
      }]
    };
  };

  // 获取提醒列表
  const getReminders = () => {
    return events
      .filter(event => moment(event.date).isSameOrAfter(moment(), 'day'))
      .sort((a, b) => moment(a.date).diff(moment(b.date)))
      .slice(0, 5);
  };
  const getBaseList =async ()=>{
    try{
      const [
        res, 
        res1,
        res2
      ] = await Promise.all([
        getCourseList(),
        getCourseFeature(),
        getCourseData()
      ]);
      setHistoryList(res.data.data)
      console.log(res1.data.data)
      generateRadarChartOptions(res.data.data[0]);
      setDataStats(res2.data.data)
    } catch (error) {
      message.error('保存失败，请重试！');
    } 

  }
useEffect( () => {
  getBaseList();
}, []);

  const radarRef = useRef();

  useEffect(() => {
    // 弹窗打开且有数据时，主动 resize
    if (isCourseDetailModalVisible && selectedCourse) {
      setTimeout(() => {
        radarRef.current?.getEchartsInstance()?.resize();
      }, 100);
    }
  }, [isCourseDetailModalVisible, selectedCourse]);

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.head}>
        <h1>我的课程</h1>
        <p>管理您的课程和会议日程，不错过每一个重要时刻</p>
      </div>
      <div className={styles.topContent}>
        {/* 左侧数据面板 */}
        <div className={styles.dataPanel}>
          <div className={`${styles.dataCard} ${styles.total}`}>
            <div className={styles.cardIcon}>
              <ScheduleOutlined />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.value}>{dataStats.courseNum}</div>
              <div className={styles.label}>课程总数</div>
              <div className={styles.description}>
                涵盖多个学科领域的完整课程体系
              </div>
            </div>
          </div>

          <div className={`${styles.dataCard} ${styles.today}`}>
            <div className={styles.cardIcon}>
              <CalendarOutlined />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.value}>{dataStats.courseResourceNum}</div>
              <div className={styles.label}>资源数量</div>
              <div className={styles.description}>
                本周新创建和发布的课程内容
              </div>
            </div>
          </div>

          <div className={`${styles.dataCard} ${styles.upcoming}`}>
            <div className={styles.cardIcon}>
              <CheckCircleOutlined />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.value}>{dataStats.activeCourseNum}</div>
              <div className={styles.label}>活跃课程</div>
              <div className={styles.description}>
                当前正在教学和更新的活跃课程
              </div>
            </div>
          </div>
        </div>

        {/* 右侧日历组件 */}
        <div className={styles.calendarPanel}>
          <div className={styles.calendarHeader}>
            <div className={styles.weekTitle}>
              <CalendarOutlined className={styles.weekIcon} />
              <span>本周日历</span>
              <span className={styles.weekRange}>
                ({moment().startOf('week').format('MM/DD')} - {moment().endOf('week').format('MM/DD')})
              </span>
            </div>
            <div className={styles.calendarActions}>
              <Button
                type="primary"
                icon={<CalendarOutlined />}
                className={styles.weeklyCalendarButton}
                onClick={showWeeklyCalendar}
                size="small"
              >
                详细视图
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className={styles.addEventButton}
                onClick={() => {
                  setSelectedDate(moment());
                  setIsAddModalVisible(true);
                }}
                size="small"
              >
                添加日程
              </Button>
            </div>
          </div>

          <div className={styles.weeklyCalendar}>
            <div className={styles.weekDays}>
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div key={day} className={styles.weekDay}>{day}</div>
              ))}
            </div>
            <div className={styles.weeklyDays}>
              {generateWeeklyCalendar().map((day, index) => (
                <div
                  key={index}
                  className={`${styles.weeklyDay} ${day.isToday ? styles.today : ''}`}
                  onClick={() => showDayEvents(day.date, day.events)}
                >
                  <div className={styles.dayNumber}>{day.date.format('D')}</div>
                  <div className={styles.dayEvents}>
                    {day.events.length > 0 ? (
                      <div className={styles.eventCount}>{day.events.length}</div>
                    ) : (
                      <div className={styles.noEvent}></div>
                    )}
                  </div>
                  {day.events.slice(0, 1).map(event => (
                    <div key={event.id} className={styles.eventPreview}>
                      {event.time}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.leftSection}>
          <div className={styles.historyPanel}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom: '22px'}}>
              <div className={styles.historyTitle}>我的课程列表</div>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={historyList.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
                className={styles.historyPagination}
                style={{ marginTop: 16, textAlign: 'right' }}
              />
            </div>
            
            <ul className={styles.historyList}>
              {pagedHistory.map(item => (
                <li 
                  key={item.id} 
                  className={styles.historyItem}
                  onClick={() => showCourseDetail(item)}
                >
                  <div className={styles.historyHeader}>
                    <div className={styles.historyName}>{item.courseName}</div>
                    <div className={styles.historyTags}>
                      {item.tags && item.tags.map(tag => (
                        <span className={styles.tag} key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.historyMeta}>
                    <span className={styles.metaItem}><b>课程周期：</b>{item.weekNumber}周</span>
                    <span className={styles.metaItem}><b>总课时：</b>{item.hours}课时</span>
                    <span className={styles.metaItem}><b>开始时间：</b>{item.startTime}</span>
                    <span className={styles.metaItem}><b>结束时间：</b>{item.endTime}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={styles.rightSection}>
          <div className={styles.remindersCard}>
            <div className={styles.cardTitle}>
              <BellOutlined className={styles.icon} />
              课程知识结构
            </div>
            <div className={styles.reminderList}>
              <div className={styles.reminderGroup}>
                <div style={{fontWeight:600,fontSize:16,color:'#1890ff'}}>
                  <BookOutlined style={{marginRight:6}} />核心知识点
                </div>
                <ul style={{marginBottom:16,paddingLeft:18}}>
                  {["Java核心语法","面向对象编程","集合框架","并发编程","JVM原理","IntelliJ IDEA使用","Maven配置与管理","Git版本控制","JUnit测试","JavaFX应用开发","Spring Boot框架","RESTful服务设计"].map((k,i)=>(
                      <Tag color="blue" key={i} style={{fontSize:14,borderRadius:6,marginBottom:'10px'}}>{k}</Tag>
                  ))}
                </ul>
              </div>
              <div className={styles.reminderGroup}>
                <div style={{fontWeight:600,fontSize:16,color:'#1890ff',marginBottom:8}}>
                  <TagOutlined style={{marginRight:6}} />学科领域
                </div>
                <div style={{marginBottom:0,paddingLeft:18}}>
                  {["计算机科学","软件工程","应用开发","Web服务"].map((s,i)=>(
                    <Tag color="blue" key={i} style={{fontSize:14,borderRadius:6}}>{s}</Tag>
                  ))}
                </div>
              </div>
              <div className={styles.reminderGroup}>
                <div style={{fontWeight:600,fontSize:16,color:'#1890ff',marginBottom:8}}>
                  <QuestionCircleOutlined style={{marginRight:6}} />题型覆盖
                </div>
                <div style={{marginBottom:0,paddingLeft:18}}>
                  {["选择题","填空题","编程题","项目实践题"].map((q,i)=>(
                    <Tag color="purple" key={i} style={{fontSize:14,borderRadius:66}}>{q}</Tag>
                  ))}
                </div>
              </div>
              <div className={styles.reminderGroup}>
                <div style={{fontWeight:600,fontSize:16,color:'#1890ff'}}>
                  <CheckCircleOutlined style={{marginRight:6}} />其他特色
                </div>
                <ul style={{marginBottom:0,paddingLeft:18}}>
                  {["支持在线测试","提供实验指导","配备项目实战","支持多平台学习"].map((o,i)=>(
                      <Tag color="blue" key={i} style={{fontSize:14,borderRadius:66,marginBottom:'10px'}}>{o}</Tag>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 本周日历弹窗 */}
      <Modal
        title={
          <div className={styles.weeklyModalTitle}>
            <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            本周日历 ({moment().startOf('week').format('MM月DD日')} - {moment().endOf('week').format('MM月DD日')})
          </div>
        }
        open={isWeeklyModalVisible}
        onCancel={() => setIsWeeklyModalVisible(false)}
        width={800}
        footer={null}
        className={styles.weeklyModal}
      >
        <div className={styles.weeklyCalendar}>
          {generateWeeklyCalendar().map((day, index) => (
            <div key={index} className={`${styles.weeklyDay} ${day.isToday ? styles.today : ''}`}>
              <div className={styles.weeklyDayHeader}>
                <div className={styles.weeklyDayName}>
                  {day.date.format('dddd')}
                </div>
                <div className={styles.weeklyDayDate}>
                  {day.date.format('MM/DD')}
                </div>
              </div>
              <div className={styles.weeklyDayEvents}>
                {day.events.length > 0 ? (
                  day.events.map(event => (
                    <div
                      key={event.id}
                      className={`${styles.weeklyEvent} ${event.type === 'important' ? styles.important : ''}`}
                    >
                      <div className={styles.eventTime}>{event.time}</div>
                      <div className={styles.eventTitle}>{event.title}</div>
                      <div className={styles.eventActions}>
                        <Tooltip title="编辑">
                          <EditOutlined 
                            className={styles.actionIcon}
                            onClick={() => handleEditEvent(event)}
                          />
                        </Tooltip>
                        <Tooltip title="删除">
                          <DeleteOutlined 
                            className={styles.actionIcon}
                            onClick={() => handleDeleteEvent(event.id)}
                          />
                        </Tooltip>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noEvents}>暂无日程</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* 课程详情弹窗 */}
      <Modal
        title={
          <div className={styles.courseDetailModalTitle} >
            <BookOutlined style={{ marginRight: 12, color: '#40a9ff', fontSize: 28, filter: 'drop-shadow(0 0 8px #1890ff)' }} />
            课程详情
          </div>
        }
        open={isCourseDetailModalVisible}
        onCancel={() => setIsCourseDetailModalVisible(false)}
        width={1100}
        footer={null}
        className={styles.courseDetailModal}
        bodyStyle={{
          background: 'linear-gradient(120deg, #e6f7ff 0%, #ffffff 100%)',
          borderRadius: '16px',
          boxShadow: '0 4px 32px rgba(24,144,255,0.18)',
          padding: '22px 30px',
          color: '#222',
          minHeight: '600px',
        }}
      >
        {selectedCourse && (
          <div className={styles.courseDetailContent} style={{
            borderRadius: '16px',
            boxShadow: '0 2px 24px rgba(64,169,255,0.08)',
            padding: '15px 20px',
            color: '#222',
          }}>
            {/* 课程基本信息 */}
            <div className={styles.courseBasicInfo} style={{display:'flex',gap:'32px'}}>
              <div className={styles.courseInfoLeft} style={{flex:2}}>
                <div className={styles.courseHeader} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'18px'}}>
                  <div className={styles.courseName} style={{display:'flex',alignItems:'center',fontSize:'20px',fontWeight:600,letterSpacing:'1px',color:'#1890ff'}}>
                    <BookOutlined className={styles.courseIcon} style={{marginRight:10,fontSize:24,filter:'drop-shadow(0 0 6px #1890ff)'}} />
                    {selectedCourse.courseName}
                  </div>
                  <div className={styles.courseStatus}>
                    <Tag color={selectedCourse.status === '进行中' ? 'green' : 'blue'} style={{fontSize:'16px',padding:'4px 16px',borderRadius:'8px',background:'rgba(24,144,255,0.12)',color:'#1890ff',border:'none'}}>
                      {selectedCourse.status || '进行中'}
                    </Tag>
                  </div>
                </div>
                <div className={styles.courseMeta} style={{marginBottom:'18px'}}>
                  <div className={styles.metaRow} style={{display:'flex',gap:'32px',marginBottom:'8px'}}>
                    <div className={styles.metaItem} style={{display:'flex',alignItems:'center',gap:'8px',color:'#222'}}>
                      <ClockIcon className={styles.metaIcon} style={{color:'#40a9ff'}} />
                      <span className={styles.metaLabel}>课程周期：</span>
                      <span className={styles.metaValue}>{selectedCourse.weekNumber}周</span>
                    </div>
                    <div className={styles.metaItem} style={{display:'flex',alignItems:'center',gap:'8px',color:'#222'}}>
                      <ScheduleOutlined className={styles.metaIcon} style={{color:'#40a9ff'}} />
                      <span className={styles.metaLabel}>总课时：</span>
                      <span className={styles.metaValue}>{selectedCourse.hours}课时</span>
                    </div>
                  </div>
                  <div className={styles.metaRow} style={{display:'flex',gap:'32px'}}>
                    <div className={styles.metaItem} style={{display:'flex',alignItems:'center',gap:'8px',color:'#222'}}>
                      <CalendarOutlined className={styles.metaIcon} style={{color:'#40a9ff'}} />
                      <span className={styles.metaLabel}>开始时间：</span>
                      <span className={styles.metaValue}>{selectedCourse.startTime}</span>
                    </div>
                    <div className={styles.metaItem} style={{display:'flex',alignItems:'center',gap:'8px',color:'#222'}}>
                      <CalendarOutlined className={styles.metaIcon} style={{color:'#40a9ff'}} />
                      <span className={styles.metaLabel}>结束时间：</span>
                      <span className={styles.metaValue}>{selectedCourse.endTime}</span>
                    </div>
                  </div>
                  <div className={styles.metaRow} style={{display:'flex',gap:'32px'}}>
                    <div className={styles.metaItem} style={{display:'flex',alignItems:'center',gap:'8px',color:'#222'}}>
                      <CalendarOutlined className={styles.metaIcon} style={{color:'#40a9ff'}} />
                      <span className={styles.metaLabel}>课程介绍：</span>
                      <span className={styles.metaValue} title={selectedCourse.introduction} style={{cursor:'pointer',color:'#ccc'}}>
                        {selectedCourse.introduction && selectedCourse.introduction.length > 20
                          ? selectedCourse.introduction.slice(0, 70) + '...'
                          : selectedCourse.introduction}
                      </span>
                    </div>
                  </div>
                </div>
                {/* 课程标签展示 */}
                {selectedCourse.courseLabel && selectedCourse.courseLabel.length > 0 && (
                  <div className={styles.courseLabels} style={{marginBottom:'18px',display:'flex',flexWrap:'wrap',gap:'10px',marginLeft:'5px'}}>
                    {selectedCourse.courseLabel.map((label, idx) => (
                      <span
                        key={idx}
                        className={styles.courseLabelTag}
                        style={{
                          background: 'linear-gradient(90deg,#e6f7ff,#bae7ff)',
                          color: '#1890ff',
                          borderRadius: '8px',
                          padding: '2px 8px',
                          fontSize: '12px',
                          boxShadow: '0 2px 8px rgba(24,144,255,0.08)',
                          letterSpacing: '1px',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        title={label}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
                {/* 当前进度 */}
                <div className={styles.courseProgress} style={{background:'rgba(24,144,255,0.08)',borderRadius:'12px',padding:'10px 18px',marginBottom:'18px',boxShadow:'0 2px 12px rgba(24,144,255,0.08)'}}>
                  <div className={styles.progressHeader} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                    <span className={styles.progressTitle} style={{fontWeight:600,fontSize:'16px',color:'#1890ff'}}>课程进度</span>
                    <span className={styles.currentWeek} style={{fontSize:'13px',color:'#222'}}>
                      第{calculateCurrentWeek(selectedCourse.startTime, selectedCourse.weekNumber)}周 / 共{selectedCourse.weekNumber}周
                    </span>
                  </div>
                  <Progress 
                    percent={calculateCourseProgress(selectedCourse.startTime, selectedCourse.endTime)} 
                    strokeColor={{
                      '0%': '#40a9ff',
                      '100%': '#87d068',
                    }}
                    showInfo={false}
                    style={{background:'#e6f7ff',borderRadius:'8px'}}
                  />
                  <div className={styles.progressText} style={{fontSize:'15px',color:'#222'}}>
                    已完成 {calculateCourseProgress(selectedCourse.startTime, selectedCourse.endTime)}%
                  </div>
                </div>

               
              </div>
              {/* 右侧雷达图 */}
              <div className={styles.courseInfoRight}>
                <ReactECharts
                  ref={radarRef}
                  option={generateRadarChartOptions(selectedCourse)}
                  style={{ height: '290px' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>
            </div>

            <Divider style={{background:'linear-gradient(90deg,#e0f7fa,#40a9ff,#722ed1)',height:'2px',border:'none',margin:'32px 0'}} />

            <div className={styles.tagRadarSection}>
              <div className={styles.sectionTitle} style={{fontSize:'18px',fontWeight:600,color:'#1890ff',display:'flex',alignItems:'center',gap:'8px'}}>
                <TagOutlined className={styles.sectionIcon} style={{fontSize:'22px',color:'#722ed1'}} />
                本周任务预览
              </div>
              <div className={styles.tagRadarChart}>
                {/* 本周任务列表渲染 */}
                {(selectedCourse && selectedCourse.teachingDevise && selectedCourse.teachingDevise.length > 0) ? (
                    <div className={styles.tagRadarItem} style={{background:'#f5f7fa',borderRadius:'10px',padding:'12px 18px',marginBottom:'10px',boxShadow:'0 2px 8px rgba(24,144,255,0.06)',display:'flex',flexDirection:'column',gap:'6px'}}>
                      <div style={{display:'flex',gap:'18px',alignItems:'center',marginBottom:'4px'}}>
                        <span style={{fontWeight:600,color:'#1890ff',fontSize:'15px'}}>{selectedCourse.teachingDevise[calculateCurrentWeek(selectedCourse.startTime, selectedCourse.weekNumber)-1].week}</span>
                        <span style={{fontWeight:500,color:'#722ed1',fontSize:'15px'}}>{selectedCourse.teachingDevise[calculateCurrentWeek(selectedCourse.startTime, selectedCourse.weekNumber)-1].teachingUnit}</span>
                        <span style={{fontWeight:500,color:'#fa8c16',fontSize:'14px'}}>课时：{selectedCourse.teachingDevise[calculateCurrentWeek(selectedCourse.startTime, selectedCourse.weekNumber)-1].classTime}</span>
                      </div>
                      <div style={{fontSize:'14px',color:'#222',marginBottom:'2px'}}><b>教学内容：</b>{selectedCourse.teachingDevise[calculateCurrentWeek(selectedCourse.startTime, selectedCourse.weekNumber)-1].teachingContent}</div>
                      <div style={{fontSize:'13px',color:'#666',marginBottom:'2px'}}><b>教学目标：</b>{selectedCourse.teachingDevise[calculateCurrentWeek(selectedCourse.startTime, selectedCourse.weekNumber)-1].teachingTarget}</div>
                      <div style={{fontSize:'13px',color:'#1890ff'}}><b>推荐资源：</b>{selectedCourse.teachingDevise[calculateCurrentWeek(selectedCourse.startTime, selectedCourse.weekNumber)-1].teachingResources}</div>
                    </div>
                ) : (
                  <div style={{textAlign:'center',color:'#ccc',fontSize:'15px',padding:'32px'}}>暂无本周任务数据</div>
                )}
              </div>
            </div>
            {/* 推荐内容展示区 */}
            <div className={styles.tagRadarSection}>
              <div className={styles.sectionTitle} style={{fontSize:'18px',fontWeight:600,color:'#1890ff',display:'flex',alignItems:'center',gap:'8px'}}>
                <TagOutlined className={styles.sectionIcon} style={{fontSize:'22px',color:'#722ed1'}} />
                智能生成建议
              </div>
              <div className={styles.tagRadarChart}>
                {/* 课程课件推荐 */}
                <div style={{marginBottom:'10px'}}>
                  <div style={{fontWeight:600,fontSize:16,color:'#1890ff',marginBottom:8}}>
                    <BookOutlined style={{marginRight:6}} />课件建议
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'16px'}}>
                    {coursewareContents && coursewareContents.map((item, idx) => (
                      <div key={idx} style={{background:'#f5f7fa',borderRadius:'10px',padding:'12px 18px',boxShadow:'0 2px 8px rgba(24,144,255,0.06)',width:'23%'}}>
                        <div style={{fontWeight:600,color:'#722ed1',fontSize:'15px',marginBottom:'6px'}}>{item.resourceName}</div>
                        <div style={{marginBottom:'6px'}}>
                          {item.resourceFeature.map((f, i) => (
                            <Tag color="blue" key={i} style={{fontSize:13,borderRadius:6,marginRight:4}}>{f}</Tag>
                          ))}
                        </div>
                        <div style={{fontSize:'13px',color:'#1890ff'}}>{item.resourceType}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* 题目推荐 */}
                <div style={{marginBottom:'10px'}}>
                  <div style={{fontWeight:600,fontSize:16,color:'#1890ff',marginBottom:8}}>
                    <QuestionCircleOutlined style={{marginRight:6}} />题目建议
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'16px'}}>
                    {questionRecommends && questionRecommends.map((item, idx) => (
                      <div key={idx} style={{background:'#f5f7fa',borderRadius:'10px',padding:'12px 18px',boxShadow:'0 2px 8px rgba(24,144,255,0.06)',width:'23%'}}>
                        <div style={{fontWeight:600,color:'#fa8c16',fontSize:'15px',marginBottom:'6px'}}>{item.resourceName}</div>
                        <div style={{marginBottom:'6px'}}>
                          {item.resourceFeature.map((f, i) => (
                            <Tag color="purple" key={i} style={{fontSize:13,borderRadius:6,marginRight:4}}>{f}</Tag>
                          ))}
                        </div>
                        <div style={{fontSize:'13px',color:'#1890ff'}}>{item.resourceType}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* 其它资源推荐 */}
                <div>
                  <div style={{fontWeight:600,fontSize:16,color:'#1890ff',marginBottom:8}}>
                    <TagOutlined style={{marginRight:6}} />其它资源建议
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'16px'}}>
                    {otherRecommends && otherRecommends.map((item, idx) => (
                      <div key={idx} style={{background:'#f5f7fa',borderRadius:'10px',padding:'12px 18px',boxShadow:'0 2px 8px rgba(24,144,255,0.06)',width:'23%'}}>
                        <div style={{fontWeight:600,color:'#1890ff',fontSize:'15px',marginBottom:'6px'}}>{item.resourceName}</div>
                        <div style={{marginBottom:'6px'}}>
                          {item.resourceFeature.map((f, i) => (
                            <Tag color="geekblue" key={i} style={{fontSize:13,borderRadius:6,marginRight:4}}>{f}</Tag>
                          ))}
                        </div>
                        <div style={{fontSize:'13px',color:'#1890ff'}}>{item.resourceType}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AddCalendar;
