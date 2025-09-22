import React, { useState, useEffect } from 'react';
import { Card, Tag, Spin, Select, DatePicker, Button } from 'antd';
import {
  HistoryOutlined,
  PieChartOutlined,
  LineChartOutlined,
  FileTextOutlined,
 BookOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  RocketOutlined,
  SaveOutlined,
  BarChartOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  FileTextOutlined as FileTextIcon,
  InteractionOutlined,
} from '@ant-design/icons';

import ReactECharts from 'echarts-for-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import dayjs from 'dayjs';
import styles from '../../scss/personalize/analytics.module.scss';
import {getResourceList,analyseGeneratedResource } from '../../api/analyis'
import { getCourseList}from '../../api/coursedesign'

const { Option } = Select;
const { RangePicker } = DatePicker;

const Analytics = () => {
  // 数据面板统计
   const stats = {
    total: 128,
    generated: 45,
    inProgress: 12,
    completed: 71
  };

  // 资源统计数据
  const [resourceData,setResourceData] = useState({
    resourceTotalVoList: [
      {
        resourceType: "交互资源",
        resourceCount: 0,
        description: "包含互动课件、在线测试、虚拟实验等,高效减轻教师负担。"
      },
      {
        resourceType: "图片资源",
        resourceCount: 6,
        description: "包含流程图、思维导图、图表、示意图等,高效减轻教师负担。"
      },
      {
        resourceType: "视频资源",
        resourceCount: 8,
        description: "包含教学视频、动画演示、实验录像等,高效减轻教师负担。"
      },
      {
        resourceType: "文本资源",
        resourceCount: 5,
        description: "包含教案、课件、试题、文档等"
      }
    ],
    resourceVariationVoList: [
      {
        resourceType: "文本资源",
        firstWeekCount: 1,
        secondWeekCount: 2,
        thirdWeekCount: 2,
        fourthWeekCount: 0
      },
      {
        resourceType: "图片资源",
        firstWeekCount: 0,
        secondWeekCount: 4,
        thirdWeekCount: 2,
        fourthWeekCount: 0
      },
      {
        resourceType: "视频资源",
        firstWeekCount: 1,
        secondWeekCount: 4,
        thirdWeekCount: 1,
        fourthWeekCount: 0
      }
    ],
    resourceKnowledgePointList: null
  });

  // 状态管理
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [analysisContent, setAnalysisContent] = useState(`根据提供的教学资源生成记录和教学计划，对Java程序设计课程的教学资源生成情况进行分析评价如下：

---

### 一、教学资源生成情况分析

1. **数量统计**：
   - 文本资源：1份（未实际生成内容）
   - 视频资源：0个
   - 图片资源：16个（主要为流程图、思维导图、时序图）

2. **类型分布**：
   - 图片资源为主，涵盖流程图、思维导图、时序图，内容集中在**类、包、接口**、**学习记录结构**、**计算机组成原理**等方面。
   - 文本资源请求为“Java基础PPT”，但未生成实际内容。
   - 无视频资源，缺乏动态演示与讲解，不利于抽象概念的可视化理解。

3. **更新频率与匹配度**：
   - 图片资源中有关Java程序设计的思维导图、流程图等与教学内容部分匹配，但不够系统。
   - 多次请求生成“类、包和接口”的图示，表明对这一部分内容的重视，但缺乏对应文本或视频的深度解析。
   - 生成了较多“计算机组成原理”相关图示，偏离当前教学主题，可能造成资源冗余。

---

### 二、提问内容分析

1. **教学内容覆盖分析**：
   - 教学计划聚焦于面向对象高级特性（如继承、多态、接口、抽象类等）。
   - 生成资源中虽有“类、包和接口”相关内容，但缺少对**继承机制**、**多态运行时行为**、**Object类方法**等核心知识点的图示或文档支持。
   - 未生成推荐资源如“继承层次图示”、“多态运行时行为模拟器”、“接口实现对比实验”，教学资源与教学目标存在脱节。

2. **是否偏离教学大纲**：
   - 生成了大量“计算机组成原理”相关图示，与当前“Java程序设计”课程主题不符，属于资源生成方向性偏差。
   - “添加学习记录的思维导图”多次出现，可能与教学无关，属于非教学内容干扰。

---

### 三、教学内容与结构诊断

1. **内容覆盖度**：
   - 当前生成资源未能全面覆盖第六周教学单元“面向对象设计（高级篇）”的核心内容。
   - 缺乏对抽象类、多态、super关键字、Object类等重点概念的可视化支持。

2. **逻辑结构与时间安排**：
   - 教学安排为4课时，需系统讲解多个抽象概念，教学资源应以辅助理解为核心。
   - 当前资源中图片虽多，但缺乏系统组织与教学逻辑关联，难以支撑教学流程。

---

### 四、个性化推荐与指导

1. **资源优化建议**：
   - 补充生成“继承层次图示”、“多态运行时行为模拟图”、“接口实现对比图”等推荐资源。
   - 增加文本资源如PPT讲义、代码示例文档，提升知识传递效率。
   - 建议引入视频资源，用于演示多态运行机制、接口实现差异等抽象内容。

2. **教学计划调整建议**：
   - 可将“类、包和接口”作为前置知识整合进当前教学内容，但应确保主次分明。
   - 建议对教学资源生成进行分类管理，避免非相关课程内容干扰。

3. **创新方向建议**：
   - 引入交互式教学资源，如Java多态模拟器、接口实现对比工具，提升学生参与度。
   - 利用AI生成代码示例与错误分析案例，辅助学生理解抽象类与接口的区别。

---

### 总结

当前教学资源生成数量偏少、类型单一，与教学目标匹配度不高，存在偏离教学大纲的现象。建议加强核心知识点的可视化资源建设，丰富资源类型，提升教学支撑能力。同时应优化资源生成方向，聚焦教学重点，避免非相关干扰内容。根据`);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 课程选项
  const [courseOptions,setCourseOptions] = useState([
    { 
      value: 'all', 
      label: '全部课程',
      description: '包含所有学科的课程资源',
      createdAt: '2024-01-01'
    },
    { 
      value: 'chinese', 
      label: '语文',
      description: '人文素养与阅读写作能力培养',
      createdAt: '2024-06-01'
    },
    { 
      value: 'math', 
      label: '数学',
      description: '逻辑思维与解题能力训练',
      createdAt: '2024-05-20'
    },
    { 
      value: 'english', 
      label: '英语',
      description: '听说读写全方位语言技能提升',
      createdAt: '2024-05-15'
    },
    { 
      value: 'physics', 
      label: '物理',
      description: '实验探究与理论结合的科学思维',
      createdAt: '2024-04-30'
    },
    { 
      value: 'chemistry', 
      label: '化学',
      description: '物质变化与反应规律探索',
      createdAt: '2024-04-25'
    }
  ]);

  // 时间范围选项
  const timeRangeOptions = [
    { value: 'week', label: '近一周' },
    { value: 'month', label: '近一月' },
    { value: 'year', label: '近一年' },
    { value: 'custom', label: '自定义' }
  ];

  // 模拟流式接收分析数据
  const fetchResourceData =async ()=>{
    try{
      const [
        res, 
        res1,
      ] = await Promise.all([
        getResourceList({
          cycleTime:'ONE_MONTH',
          courseid:8
        }),
        getCourseList()
      ]);
      setCourseOptions(res1.data.data)
      setResourceData(res.data.data)
    }catch(e){
      
    }
  }
  useEffect(() => {
     fetchResourceData();
  }, []);

  // 资源类型颜色映射函数
  const getResourceTypeColor = (type) => {
    const colorMap = {
      '交互资源': '#722ed1',
      '图片资源': '#52c41a',
      '视频资源': '#1890ff',
      '文本资源': '#fa8c16'
    };
    return colorMap[type] || '#1890ff';
  };

  // 资源类型背景颜色映射
  const getResourceTypeBgColor = (type) => {
    const bgColorMap = {
      '交互资源': 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
      '图片资源': 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
      '视频资源': 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
      '文本资源': 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)'
    };
    return bgColorMap[type] || 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)';
  };

  // 资源类型饼图配置
  const resourcePieOption = {
    title: {
      text: '资源类型分布',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: '资源类型',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        data: resourceData?.resourceTotalVoList?.map(item => ({
          value: item.resourceCount,
          name: item.resourceType,
          itemStyle: {
            color: getResourceTypeColor(item.resourceType)
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  // 资源变化趋势图配置
  const resourceTrendOption = {
    title: {
      text: '资源变化趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: resourceData?.resourceVariationVoList?.map(item => item.resourceType),
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['当前周', '前一周', '前两周', '前三周']
    },
    yAxis: {
      type: 'value'
    },
    series: resourceData?.resourceVariationVoList?.map(item => ({
      name: item.resourceType,
      type: 'line',
      smooth: true,
      data: [item.firstWeekCount, item.secondWeekCount, item.thirdWeekCount, item.fourthWeekCount],
      itemStyle: {
        color: getResourceTypeColor(item.resourceType)
      },
      areaStyle: {
        color: getResourceTypeColor(item.resourceType),
        opacity: 0.1
      }
    }))
  };

  // 获取资源类型图标
  const getResourceTypeIcon = (type) => {
    const iconMap = {
      '交互资源': <InteractionOutlined />,
      '图片资源': <PictureOutlined />,
      '视频资源': <VideoCameraOutlined />,
      '文本资源': <FileTextIcon />
    };
    return iconMap[type] || <FileTextOutlined />;
  };
  const token = localStorage.getItem('accessToken');
  // 处理分析按钮点击
  const handleAnalyze = async () => {
    // 这里可以调用API获取分析数据
    console.log('分析参数:', {
      course: selectedCourse,
      timeRange: selectedTimeRange,
      dateRange: selectedDateRange
    });
    setAnalysisContent('')
    try {
      const response = await fetch(`http://14.103.151.91:8080/Api/Agent/analyse/analyseGeneratedResource?cycleTime=ONE_MONTH&courseid=8`, {
        method: 'GET',
        headers: {
          'satoken':token
        },
      });
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
          setAnalysisContent(prev => prev + cleanedLine);
        });

      }
      console.log(analysisContent)
    } catch (err) {
      console.error('Failed to fetch textbooks:', err);
    } finally {
      
    }
  };

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.header}>
        <h1>个性化分析</h1>
        <p>深入分析您的资源使用情况和生成效果</p>
      </div>
      <div className={styles.content}>
        <div className={styles.contentLeft}>
          <Card title="资源统计概览" className={styles.statCard}>
            <div className={styles.resourceStats}>
              {resourceData?.resourceTotalVoList?.map((item, index) => (
                <div 
                  key={index} 
                  className={styles.resourceStatItem}
                  style={{ background: getResourceTypeBgColor(item.resourceType) }}
                >
                  <div 
                    className={styles.resourceIcon}
                    style={{ 
                      background: getResourceTypeColor(item.resourceType),
                      color: 'white'
                    }}
                  >
                    {getResourceTypeIcon(item.resourceType)}
                  </div>
                  <div className={styles.resourceInfo}>
                    <div className={styles.resourceType}>{item.resourceType}</div>
                    <div className={styles.resourceCount}>{item.resourceCount} 个</div>
                    <div className={styles.resourceDescription}>
                      {index===0?"包含互动课件、在线测试、虚拟实验等,高效减轻教师负担。"
                      :index===1?'包含流程图、思维导图、图表、示意图等,高效减轻教师负担。'
                      :index===1?'包含教学视频、动画演示、实验录像等,高效减轻教师负担。'
                      :'包含教案、课件、试题、文档等'
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className={styles.contentRight}>
          <div className={styles.chartContainer}>
            <ReactECharts option={resourcePieOption} style={{ height: '300px' }} />
          </div>
          <div className={styles.chartContainer}>
            <ReactECharts option={resourceTrendOption} style={{ height: '300px' }} />
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomLeft}>
          {/* 课程选择 */}
          <Card title="课程选择" className={styles.courseSelectCard}>
            <div className={styles.courseList}>
              {courseOptions.map(option => (
                <div
                  key={option.courseId}
                  className={`${styles.courseItem} ${selectedCourse === option.courseId ? styles.courseItemActive : ''}`}
                  onClick={() => setSelectedCourse(option.courseId)}
                >
                  <div className={styles.courseIcon}>
                    <BookOutlined />
                  </div>
                  <div className={styles.courseInfo}>
                    <div className={styles.courseName}>{option.courseName}</div>
                    <div className={styles.courseDescription}>课时：{option.classTime} - 周数：{option.weekNumber}</div>
                    <div className={styles.courseTime}>开始时间：{option.startTime?.split("T")[0]}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 时间范围选择 */}
          <Card title="时间范围" className={styles.timeRangeCard}>
            <div className={styles.settingItem}>
              <Select
                value={selectedTimeRange}
                onChange={setSelectedTimeRange}
                style={{ width: '100%' }}
                placeholder="请选择时间范围"
              >
                {timeRangeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>

            {selectedTimeRange === 'custom' && (
              <div className={styles.settingItem}>
                <label>自定义时间：</label>
                <RangePicker
                  value={selectedDateRange}
                  onChange={setSelectedDateRange}
                  style={{ width: '100%', marginTop: '8px' }}
                  placeholder={['开始日期', '结束日期']}
                />
              </div>
            )}
          </Card>

          {/* 开始分析按钮 */}
          <div className={styles.analyzeButtonContainer}>
            <Button 
              type="primary" 
              onClick={handleAnalyze}
              icon={<BarChartOutlined />}
              size="large"
              style={{ width: '100%', height: '48px', fontSize: '16px' }}
            >
              开始分析
            </Button>
          </div>
        </div>
        <div className={styles.bottomRight}>
         <Card title="分析报告" className={styles.analysisCard}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={() => {
                  // 导出为txt文件
                  const blob = new Blob([analysisContent], { type: 'text/plain;charset=utf-8' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = '分析报告.txt';
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
              >
                导出报告
              </Button>
            </div>
            {isAnalyzing ? (
              <div className={styles.loadingContainer}>
                <Spin size="large" />
                <p>正在生成分析报告...</p>
              </div>
            ) : (
              <div className={styles.markdownContent}>
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >{analysisContent}</ReactMarkdown>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
