import React, { useState ,useEffect} from 'react';
import { Input, Button, Select, Tag, Card, Row, Col, Statistic, Badge, Tooltip, Empty, Dropdown, Menu, Pagination } from 'antd';
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
  BarsOutlined
} from '@ant-design/icons';
import styles from '../../../scss/agentManage/myResources/videoRes.module.scss';
import img from '../../../image/1.png'
import {getVideoResource,getVideoSum} from '../../../api/video'
import { useNavigate } from 'react-router-dom';
import {getPrivateResource}from '../../../api/courseware';
const { Search } = Input;
const { Option } = Select;
 
const VideoRes = () => {
  const [sortType, setSortType] = useState('hot');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [total, setTotal] = useState(30); // 总数据量，实际应该从后端获取
  const userInfo =JSON.parse(localStorage.getItem('user')) ;
  const navigate = useNavigate();
  // 模拟数据
  const [statistics,setStatistics] =useState();

  const categories = [
    { 
      title: '视频类型', 
      options: ['微课', '实验课', '理论课', '复习课', '专题课', '拓展课', '研讨课']
    },
    {
      title: '制作方式',
      options: ['录播', '直播回放', 'AI生成', '动画制作']
    }
  ];
  const [sum,serSum ]=useState()
  const [videos,setVideos] = useState([ ]);

    const handleSearch = (e) => {
        setSearchValue(e.target.value);
    };

  // 处理分页变化
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
    fetchData(page)
    // 这里应该调用后端API获取对应页的数据
  };

  // 处理每页条数变化
  const handleShowSizeChange = (current, size) => {
    setCurrentPage(1);
    setPageSize(size);
    // 这里应该调用后端API获取对应页的数据
  };
 const fetchData=async (page)=>{
    try{
      const res =await getPrivateResource({
        searchUserId: parseInt(userInfo.uid),
        pageNum:currentPage,
        pageSize:6,
        searchKey:searchValue,
        resourceType:'视频',
        resourceViews:0
      });
      setVideos(res.data.data)
    }catch(e){

    }
  }
  const fetchSumData= async ()=>{
     try{
      const res =await getVideoSum(userInfo.uid);
      console.log(res.data.data);
      const newSum=[
        { 
          title: '视频总数', 
          value: res.data.data.resourceSum, 
          icon: <VideoCameraOutlined />, 
          color: '#1890ff',
          trend: '+12%',
          description: '较上月增长'
        },
        { 
          title: '本月上传', 
          value: res.data.data.monthSum, 
          icon: <CloudUploadOutlined />, 
          color: '#52c41a',
          trend:  res.data.data.weekSum,
          description: '本周新增'
        },
        { 
          title: '今日上传', 
          value: res.data.data.daySum, 
          icon: <PlayCircleOutlined />, 
          color: '#722ed1',
          trend:  res.data.data.daySum,
          description: '今日增长'
        },
        { 
          title: '收藏数', 
          value: 1, 
          icon: <StarOutlined />, 
          color: '#fa8c16',
          trend: '+1',
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
  const handleNavigation = (id) => {
    navigate('/VideoDe/'+id)
  };
  return (
    <div className={styles.videoResContainer}>
      {/* 头部标题 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h>视频资源管理</h>
            <p>高效管理教学视频资源，快速检索、智能分类，提升教学效率</p>
          </div>
          <div className={styles.headerActions}>
            <Button type="primary" icon={<PlusOutlined />} size="large">
              上传视频
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
          {statistics?.map((stat, index) => (
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
              <Button.Group>
                <Tooltip title="网格视图">
                  <Button
                    type={viewMode === 'grid' ? 'primary' : 'default'}
                    icon={<AppstoreOutlined />}
                    onClick={() => setViewMode('grid')}
                  />
                </Tooltip>
                <Tooltip title="列表视图">
                  <Button
                    type={viewMode === 'list' ? 'primary' : 'default'}
                    icon={<BarsOutlined />}
                    onClick={() => setViewMode('list')}
                  />
                </Tooltip>
              </Button.Group>
              <Select
                defaultValue="hot"
                onChange={(value) => setSortType(value)}
                className={styles.sortSelect}
                size="large"
                suffixIcon={<SortAscendingOutlined />}
              >
                <Option value="hot">热门排序</Option>
                <Option value="smart">智能推荐</Option>
                <Option value="time">最新发布</Option>
                <Option value="views">最多播放</Option>
              </Select>
            </div>
          </div>

          {/* 分类筛选 */}
        </Card>
      </div>

      {/* 视频内容展示区域 */}
      <div className={styles.contentSection}>
        <h>结果显示</h>
        {videos?.length > 0 ? (
          <>
            <div className={styles.videoGrid}>
              {videos?.map((video) => (
                <div className={styles.videoCard} key={video.videoId}  onClick={()=>handleNavigation(video.videoId)}>
                  <div className={styles.videoThumbnail}>
                     <div className={styles.videoPreview}>
                      <img src={img} alt={video.videoName} />
                      <div className={styles.duration}>
                        <ClockCircleOutlined /> {video.duration}
                      </div>
                      <div className={styles.playButton}>
                        <PlayCircleOutlined />
                      </div>
                      {video.status === 'processing' && (
                        <div className={styles.processingStatus}>
                          <Badge status="processing" text="处理中" />
                        </div>
                      )}
                    </div>
                    <h3>{video.videoName}</h3>
                  </div>
                  <div className={styles.videoInfo}>
                    <div className={styles.videoMeta}>
                      <span><CalendarOutlined /> {video.sendTime?.split('T')[0]}</span>
                      <span><EyeOutlined /> 0</span>
                      <span><StarOutlined />0</span>
                    </div>
                    <p className={styles.videoDescription}>{video.videoIntroduction}</p>
                    <div className={styles.videoTags}>
                      <Tag color="blue">
                        <TagOutlined /> 视频
                      </Tag>
                      <Tag color="blue">
                        <TagOutlined />资源
                      </Tag>
                        <Tag color="blue">
                        <TagOutlined />讲解
                      </Tag>
                    </div>
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
                showTotal={(total) => `共 ${total} 个视频资源`}
                pageSizeOptions={['9', '12', '24', '36']}
              />
            </div>
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无视频资源"
          />
        )}
      </div>

      
    </div>
  );
};

export default VideoRes;
