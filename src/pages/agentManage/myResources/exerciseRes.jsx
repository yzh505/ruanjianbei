import React, { useState,useEffect } from 'react';
import { Input, Button, Select, Tag, Card, Row, Col, Statistic, Badge, Tooltip, Empty, Dropdown,Menu,Pagination } from 'antd';
import {
  SearchOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  TagOutlined,
  StarOutlined,
  VideoCameraOutlined,
  CloudUploadOutlined,
  PlusOutlined,
  FilterOutlined,
  EyeOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  SortAscendingOutlined,
  CloudSyncOutlined,
  AppstoreOutlined,
  BarsOutlined,
  FileOutlined
} from '@ant-design/icons';
import styles from '../../../scss/agentManage/myResources/exerciseRes.module.scss';
import img from '../../../image/1.png'
import {getPrivateResource,saveTextResource} from '../../../api/courseware'; 
import {question,getQuestionSum} from '../../../api/exercise';
import { useNavigate } from 'react-router-dom';
const { Search } = Input;
const { Option } = Select;

const TeacherPlanRes = () => {
  const [sortType, setSortType] = useState('hot');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [total, setTotal] = useState(100); // 总数据量，实际应该从后端获取
  const userInfo =JSON.parse(localStorage.getItem('user')) ;
   const navigate = useNavigate();
  // 模拟数据
  const [statistics,setStatistics] =useState([]);

  const categories = [
    { 
      title: '题目类型', 
      options: ['教学课件', '汇报展示', '主题模板', '图表模板', '动画模板']
    },
    {
      title: '生成方式',
      options: ['AI生成', '手动制作', '模板生成', '协同编辑']
    }
  ];

  const [pptResources,setPPtRes] = useState([
    {
      id: 1,
      title: '高中物理力学知识导学课件',
      preview: 'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_19052329831_q1PjK61731549744816-015276761286617369.jpeg?authorization=c2ltcGxlLWp3dCBhaz1zcGFya2Rlc2s4MDAwMDAwMDAwMDE7ZXhwPTMzMDgzNDk3NDY7YWxnbz1obWFjLXNoYTI1NjtzaWc9dGk2YmwvSzJkWTQvbzBSMmM4dy9kbG1nMmRRRGMxbmlJQ1hzUXJVTVVkST0=&x_location=7YfmxI7B7uKO7jlRxIftd60pe5D=&bg=',
      pages: 25,
      createTime: '2024-03-20',
      description: '本课件包含力学基础知识的详细讲解，配有丰富的图表和动画效果，适合高一物理教学使用。',
      tags: ['物理', '力学', '高一', '动画'],
      thumbnail: img,
      downloads: 234,
      views: 890,
      collects: 45,
      status: 'published', // published, draft, processing
      quality: '精品'
    },
    {
      id: 2,
      title: '化学元素周期表教学课件',
      preview: 'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_1742734573449-03506464373301561.jpeg?authorization=c2ltcGxlLWp3dCBhaz1zcGFya2Rlc2s4MDAwMDAwMDAwMDE7ZXhwPTMzMTk1MzQ1Nzg7YWxnbz1obWFjLXNoYTI1NjtzaWc9UXd3NlhwcWdRMG9QQmV4dnZVbXVVazRBQi9mRmdmc3pIVm9lWWdDaXhkUT0=&x_location=7YfmxI7B7uKO7jlRxIftd60weXD=&bg=',
      pages: 18,
      createTime: '2024-03-19',
      description: '通过生动的图表和互动设计，帮助学生理解元素周期表的规律和应用，包含丰富的例题和练习。',
      tags: ['化学', '元素周期表', '高中', '互动'],
      thumbnail: img,
      downloads: 156,
      views: 678,
      collects: 32,
      status: 'published',
      quality: '精品'
    },
    {
      id: 3,
      title: '生物细胞结构详解课件',
      preview: 'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_1742734573449-03506464373301561.jpeg?authorization=c2ltcGxlLWp3dCBhaz1zcGFya2Rlc2s4MDAwMDAwMDAwMDE7ZXhwPTMzMTk1MzQ1Nzg7YWxnbz1obWFjLXNoYTI1NjtzaWc9UXd3NlhwcWdRMG9QQmV4dnZVbXVVazRBQi9mRmdmc3pIVm9lWWdDaXhkUT0=&x_location=7YfmxI7B7uKO7jlRxIftd60weXD=&bg=',
      pages: 30,
      createTime: '2024-03-18',
      description: '使用3D模型和微观图片，详细展示细胞结构和功能，配有生动的动画演示过程。',
      tags: ['生物', '细胞结构', '高中', '3D'],
      thumbnail: img,
      downloads: 189,
      views: 745,
      collects: 38,
      status: 'published',
      quality: '精品'
    }
  ]);
  const handleSearch = (e) => {
    setSearchValue(e.target.value);
  };

  // 处理分页变化
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
    // 这里应该调用后端API获取对应页的数据
  };

  // 处理每页条数变化
  const handleShowSizeChange = (current, size) => {
    setCurrentPage(1);
    setPageSize(size);
    // 这里应该调用后端API获取对应页的数据
  };
  const handleNavigation = () => {
    navigate('/VideoDe')
  };
  const fetchData=async (page)=>{
    try{
      const res =await getPrivateResource({
        searchUserId: parseInt(userInfo.uid),
        pageNum:page,
        pageSize:8,
        searchKey:searchValue,
        resourceType:'题目',
        resourceViews:0
      });
      setPPtRes(res.data.data)
    }catch(e){

    }
  }
   const fetchSumData= async ()=>{
    try{
      const res =await getQuestionSum(userInfo.uid);
      console.log(res.data.data);
      setTotal(res.data.data.resourceSum)
      const newSum=[
        { 
          title: '题目总数', 
          value: res.data.data.resourceSum, 
          icon: <FileOutlined />, 
          color: '#1890ff',
          trend: '+15%',
          description: '较上月增长'
        },
        { 
          title: '本月生成', 
          value: res.data.data.monthSum, 
          icon: <PlusOutlined />, 
          color: '#52c41a',
          trend:'+'+res.data.data.weekSum,
          description: '本周新增'
        },
        { 
          title: '今日生成', 
          value: res.data.data.daySum, 
          icon: <DownloadOutlined />, 
          color: '#722ed1',
          trend: '+328',
          description: '本周下载'
        },
        { 
          title: '收藏数', 
          value: 68, 
          icon: <StarOutlined />, 
          color: '#fa8c16',
          trend: '+8',
          description: '本周收藏'
        }
      ] 
      setStatistics(newSum)
    }catch(e){
    }
  }
useEffect(() => {
    fetchData(currentPage); 
}, [searchValue,currentPage]);
useEffect(() => {
    fetchData(1); 
    fetchSumData()
}, []);
  return (
    <div className={styles.videoResContainer}>
      {/* 头部标题 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h>题目资源管理</h>
            <p>高效管理题目资源，快速检索、智能分类，提升教学效率</p>
          </div>
          <div className={styles.headerActions}>
            <Button type="primary" icon={<PlusOutlined />} size="large">
              生成题目
            </Button>
            <Button icon={<CloudSyncOutlined />} size="large">
              同步资源
            </Button>
          </div>
        </div>
      </div>

      {/* 数据统计面板 */}
      <div className={styles.statisticsPanel}>
        <Row gutter={[16, 16]}>
          {statistics.map((stat, index) => (
            <Col key={index} xs={24} sm={12} md={6}>
              <Card className={styles.statCard} hoverable>
                <div className={styles.statContent}>
                  <div className={styles.statIcon} style={{ backgroundColor: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className={styles.statInfo}>
                    <Statistic title={stat.title} value={stat.value} />
                    <div className={styles.statTrend}>
                      <span className={styles.trendValue}>{stat.trend}</span>
                      <span className={styles.trendDesc}>{stat.description}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 搜索和筛选区域 */}
      <div className={styles.searchFilterSection}>
        <Card>
          <div className={styles.searchRow}>
            <h>资源搜索</h>
            <div className={styles.searchBox}>
                <SearchOutlined className={styles.searchIcon} />
                <input
                  className={styles.input}
                  placeholder="搜索课程、资源、文档..."
                  value={searchValue}
                  onChange={handleSearch}
                />
            </div>
            <div className={styles.viewActions}>
              <Select
                defaultValue="hot"
                onChange={(value) => setSortType(value)}
                className={styles.sortSelect}
                size="large"
                suffixIcon={<SortAscendingOutlined />}
              >
                <Option value="hot">热门排序</Option>
              </Select>
            </div>
          </div>
        </Card>
      </div>
      <div className={styles.contentSection}>
        {pptResources.length > 0 ? (
          <>
            <div className={styles.videoGrid}>
              {pptResources.map((item) => (
                <div  key={item.id} hoverable className={styles.itemCard} style={{borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(24,144,255,0.08)', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
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
              ))}
            </div>
            <div className={styles.paginationWrapper}>
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={total}
                    onChange={handlePageChange}
                    onShowSizeChange={handleShowSizeChange}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total) => `共 ${total} 题目资源`}
                    pageSizeOptions={['9', '12', '24', '36']}
                  />
                </div>
              </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无题目资源"
          />
        )}
      </div>
    </div>
  );
};

export default TeacherPlanRes;
