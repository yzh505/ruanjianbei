import React, { useState, useRef, useEffect } from 'react';
import { Card, Upload, Button, Space, Row, Col, Timeline, Statistic, message, Spin, Progress, Modal, Select } from 'antd';
import {
  UploadOutlined,
  VideoCameraOutlined,
  ScissorOutlined,
  BulbOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  DownloadOutlined,
  CopyOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';
import { FolderPlus, Close} from '@icon-park/react';
import ReactMarkdown from 'react-markdown'; // 用于渲染Markdown
import styles from '../../scss/generate/mediaResources.module.scss';
import {uploadVideo} from '../../api/courseware';
import MindMap from '../components/mindMap';
import html2canvas from 'html2canvas';
import {videoResource} from '../../api/video'; // 导入教案列表查询API
import {uploadFile } from '../../api/user'
import {getCourseList} from '../../api/coursedesign'
const { Option } = Select;
const MediaResources = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoData, setVideoData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [zoom, setZoom] = useState(1);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1.5);
  const userInfo =JSON.parse(localStorage.getItem('user')) ;
  const [coverUrl, setCoverUrl] = useState('');
  const [courseList, setCourseList] = useState([]);
  const videoRef = useRef(null);
  const [videoDuration, setVideoDuration] = useState(0);
// 视频加载后获取时长
const handleLoadedMetadata = (e) => {
  setVideoDuration(e.target.duration);
  setVideoData(prev => prev ? { ...prev, videoDuration: e.target.duration } : prev);
};
// 时间字符串转秒数
const timeStrToSeconds = (str) => {
  if (!str) return 0;
  const arr = str.split(':').map(Number);
  if (arr.length === 2) return arr[0] * 60 + arr[1];
  if (arr.length === 3) return arr[0] * 3600 + arr[1] * 60 + arr[2];
  return Number(str) || 0;
};

// 跳转到指定时间
const handleJumpToTime = (timeStr) => {
  const seconds = timeStrToSeconds(timeStr);
  if (videoRef.current) {
    videoRef.current.currentTime = seconds;
    videoRef.current.play();
  }
};
  // 获取课程列表（假设有getCourseList接口）
  useEffect(() => {
    // TODO: 替换为实际接口
    async function fetchCourses() {
      try {
         const res = await getCourseList();
         setCourseList(res.data.data);
      } catch (e) {}
    }
    fetchCourses();
  }, []);

  const handleCoverUpload = async ({ file }) => {
    // 模拟上传，实际应调用图片上传接口
    const fileData =new FormData();
    fileData.append('file',file)
    const res = await uploadFile(fileData)
      console.log(res.data.data.fileUrl);
    let url=res.data.data.fileUrl
    setCoverUrl(url);
    setSaveFormData(prev => ({ ...prev, cover: url }));
  };
  // 保存为图片
  const handleSavePreviewImage = async () => {
    const dom = document.getElementById('mindmap-preview-modal');
    if (!dom) return;
    const canvas = await html2canvas(dom, { useCORS: true, backgroundColor: '#fff' });
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = '知识图谱.png';
    link.click();
  };

  const handleUpload = async (info) => {
    const { file } = info;
    
    if (file.status === 'uploading') {
      setIsUploading(true);
      setUploadProgress(0);
      const timer = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(timer);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
    } else if (file.status === 'done') {
      setIsUploading(false);
      setUploadProgress(100);
      setIsProcessing(true);
      
      const url = URL.createObjectURL(file.originFileObj);
      setVideoUrl(url);
      setSelectedFile(file.originFileObj);
      
      try {
        // 创建 FormData 对象
        const formData = new FormData();
        formData.append('file', file.originFileObj);
        // 调用上传接口
        const response=await uploadVideo({
          file:formData,
          isKnowledgePoints:true,
          isSummary:true,
          isKnowledgeGraph:true,
          isLabel:true,
        })
        const res=response.data.data;
        // 解析 knowledgepoints
        let parsedKnowledgePoints = [];
        if (res.videoSliver && typeof res.videoSliver === 'string') {
          // 尝试将字符串转为数组对象
         
          const arr = res.videoSliver.match(/KnowledgePointVo\((.*?)\)/g);
           console.log(arr)
          if (arr) {
            parsedKnowledgePoints = arr.map(item => {
              const startTime = item.match(/startTime=(.*?),/);
              const endTime = item.match(/endTime=(.*?),/);
              const text = item.match(/text=(.*)\)/);
              return {
                startTime: startTime ? startTime[1] : '',
                endTime: endTime ? endTime[1] : '',
                text: text ? text[1].trim() : ''
              };
            });
           
          }
           console.log(parsedKnowledgePoints)
        }
        // 解析 knowledgegraph
        let parsedKnowledgeGraph = [];
        if (res.knowledgegraph && typeof res.knowledgegraph === 'string') {
          // 尝试将字符串转为数组对象
          const arr = res.knowledgegraph.match(/RelationshipVo\((.*?)\)/g);
          if (arr) {
            parsedKnowledgeGraph = arr.map(item => {
              const startEntity = item.match(/startEntity=(.*?),/);
              const endEntity = item.match(/endEntity=(.*?),/);
              const relationship = item.match(/relationship=(.*)\)/);
              return {
                startEntity: startEntity ? startEntity[1] : '',
                endEntity: endEntity ? endEntity[1] : '',
                relationship: relationship ? relationship[1].trim() : ''
              };
            });
          }
        }
        // 合并到 res.data 以便后续渲染
        const videoDataObj = {
          ...res,
          parsedKnowledgePoints,
          parsedKnowledgeGraph
        };
        
        console.log('上传成功:', videoDataObj);
        message.success('视频上传成功，正在分析处理...');
        setVideoData(videoDataObj);
        
      } catch (error) {
       
        message.error('视频上传失败，请重试');
      } finally {
        setIsProcessing(false);
      }
    } else if (file.status === 'error') {
      message.error(`${file.name} 上传失败`);
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const uploadProps = {
    name: 'video',
    multiple: false,
    accept: 'video/*',
    showUploadList: false,
    customRequest: ({ file, onSuccess }) => {
      // 模拟上传
      setTimeout(() => {
        onSuccess();
      }, 1000);
    },
    onChange: handleUpload
  };
  const fetchData = async () => {
    try{
      
    }catch (error) {
      console.error('数据获取失败:', error);
      message.error('数据获取失败，请稍后重试');
    }
  }
  const [content, setContent] = useState();

  // 将 parsedKnowledgeGraph 转换为 MindMap 格式
  const getGraphContent = () => {
    if (videoData?.parsedKnowledgeGraph && videoData.parsedKnowledgeGraph.length > 0) {
      return videoData.parsedKnowledgeGraph.map(item => ({
        entity1: item.startEntity,
        ship: item.relationship,
        entity2: item.endEntity
      }));
    }
    return content;
  };

  const renderVideoSection = () => (
    <div className={styles.videoPlayerSection}>
      <div className={styles.videoContainer}>
        {videoUrl ? (
          <video
            ref={videoRef}
            controls
            className={styles.videoPlayer}
            src={videoUrl}
            onLoadedMetadata={handleLoadedMetadata}
          />
        ) : (
          <Upload {...uploadProps} className={styles.uploadArea}>
            <div className={styles.uploadContent}>
              <VideoCameraOutlined className={styles.uploadIcon} />
              <p className={styles.uploadText}>点击或拖拽视频文件到此区域</p>
              <p className={styles.uploadHint}>支持 MP4, AVI, MOV 等主流视频格式</p>
            </div>
          </Upload>
        )}
      </div>
      <div className={styles.videoActions}>
        <Upload {...uploadProps}>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
          >
            {videoUrl ? '更换视频' : '上传视频'}
          </Button>
        </Upload>
        <Button 
          type="primary" 
          icon={<ScissorOutlined />}
          onClick={() => window.open('http://www.tomc.fun/', '_blank')}
        >
          去生成视频
        </Button>
        <Button 
          icon={<BulbOutlined />}
          onClick={()=>setIsSaveModalOpen(true)}
          disabled={!videoUrl}
        >
          保存视频
        </Button>
        
      </div>
      {isUploading && (
        <div className={styles.progressBar}>
          <Progress percent={uploadProgress} status="active" />
        </div>
      )}
      {isProcessing && (
        <div className={styles.processing}>
          <Spin tip="正在分析处理中..." />
        </div>
      )}
      
      {/* 添加音频文本模块 */}
      <Card 
        title={
          <div className={styles.transcriptHeader}>
            <span>音频文本</span>
            <div className={styles.transcriptActions}>
          <Button 
            type="text" 
                icon={<DownloadOutlined />}
                disabled={!videoData?.audioTranscript}
              >
                导出文本
              </Button>
          <Button 
            type="text" 
                icon={<CopyOutlined />}
                disabled={!videoData?.audioTranscript}
              >
                复制全文
              </Button>
            </div>
          </div>
        }
        className={styles.transcriptCard}
      >
        {videoData?.videoText ? (
          <div className={styles.transcriptContent}>
            <p>{videoData.videoText}</p>
          </div>
        ) : (
          <div className={styles.emptyText}>暂无音频文本数据</div>
        )}
      </Card>
    </div>
  );

  const renderDataPanel = () => (
    <div className={styles.dataPanelSection}>
      <Row gutter={[24, 24]}>
        <Col span={8}>
          <Card className={styles.statCard}>
            <Statistic 
              title="视频时长" 
              value={(videoDuration/60).toFixed(0)+'分'+(videoDuration-60*(videoDuration/60).toFixed(0)).toFixed(0)+'秒' || '-'}
              prefix={<ClockCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className={styles.statCard}>
            <Statistic 
              title="观看次数" 
              value={videoData?.videoViews || '-'}
              prefix={<EyeOutlined />} 
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className={styles.statCard} >
            <Statistic 
              title="知识点数量" 
              value={videoData?.parsedKnowledgePoints?.length|| 0}
              prefix={<BulbOutlined />} 
            />
          </Card>
        </Col>
      </Row>

      <Card title="视频信息" className={styles.infoCard}>
        <p><strong>名称：</strong>{videoData?.videoName || '-'}</p>
      </Card>
      <Card title="视频总结" className={styles.infoCard1} >
        <ReactMarkdown >{videoData?.videoSummary}</ReactMarkdown>
      </Card>

      <Card title={<span>知识图谱</span>}
        className={styles.graphCard}
        extra={
          <div className={styles.graphActions}>
            <ZoomInOutlined onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className={styles.graphActionBtn} />
            <ZoomOutOutlined onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))} className={styles.graphActionBtn} />
            <EyeOutlined onClick={() => setPreviewVisible(true)} className={styles.graphActionBtn} />
          </div>
        }
      >
        {videoData?.parsedKnowledgeGraph && videoData.parsedKnowledgeGraph.length > 0 ? (
          <div className={styles.graphContainer}>
            <MindMap code={getGraphContent()} setCode={setContent} zoom={zoom} />
          </div>
        ) : (
          <div className={styles.graphContainer}>
            <MindMap code={content} setCode={setContent} zoom={zoom} />
          </div>
        )}
      <Modal
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
          width={1000}
          bodyStyle={{ height: 700 }}
          title="知识图谱预览"
        >
          <div style={{ width: '100%', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 8 }}>
              <ZoomInOutlined onClick={() => setPreviewZoom(z => Math.min(z + 0.2, 2))} className={styles.graphActionBtn} />
              <ZoomOutOutlined onClick={() => setPreviewZoom(z => Math.max(z - 0.2, 0.4))} className={styles.graphActionBtn} />
              <Button size="small" icon={<DownloadOutlined />} onClick={handleSavePreviewImage}>保存为图片</Button>
            </div>
            <div id="mindmap-preview-modal" style={{ width: '100%', height: '620px', background: '#fff', borderRadius: 8, overflow: 'auto' }}>
              <MindMap code={getGraphContent()} setCode={setContent} zoom={previewZoom} />
            </div>
          </div>
        </Modal>
      </Card>

      <Card title="知识点分片" className={styles.timelineCard}>
        {videoData?.parsedKnowledgePoints && videoData.parsedKnowledgePoints.length > 0 ? (
          <Timeline>
            {videoData.parsedKnowledgePoints.map((slice, index) => (
              <Timeline.Item key={index}>
                <p
                  className={styles.timeRange}
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => handleJumpToTime(slice.startTime)}
                  title="点击跳转到视频对应时间"
                >
                  时间节点:{slice.startTime}
                </p>
                <p className={styles.timeContent}>{slice.text}</p>
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <div className={styles.emptyText}>暂无知识点分片数据</div>
        )}
      </Card>
    </div>
  );

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
    const handleSaveSubmit = async () => {
        setIsSaving(true);
        try {
          // 这里添加实际的保存逻辑
          const res =await videoResource(
            {
                "videoId": videoData.videoId,
                "video_picture": saveFormData.cover,
                "videoName": saveFormData.name,
                "videoIntroduction": saveFormData.notes,
                "course_id": 0
            });
          setIsSaveModalOpen(false);
          message.success('保存成功')
          fetchData()
        } catch (error) {
          message.error('保存失败，请重试！');
        } finally {
          setIsSaving(false);
        }
    };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h>智能视频分析平台</h>
        <p>上传视频，自动生成知识图谱、内容总结、知识点提取</p>
      </div>

      <div className={styles.mainContent}>
        <Row gutter={24}>
          <Col span={14}>
            {renderVideoSection()}
          </Col>
          <Col span={10}>
            {renderDataPanel()}
          </Col>
        </Row>
      </div>
      {isSaveModalOpen && (
        <div className={styles.saveModalOverlay} onClick={() => setIsSaveModalOpen(false)}>
          <div className={styles.saveModalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>保存视频</h3>
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
                <div className={styles.text}>放入视频库</div>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>视频名称</label>
              <input
                type="text"
                name="name"
                value={saveFormData.name}
                onChange={handleInputChange}
                placeholder="请输入视频名称"
              />
            </div>

            <div className={styles.formGroup}>
              <label>视频封面</label>
              <Upload
                accept="image/*"
                showUploadList={false}
                customRequest={handleCoverUpload}
              >
                <div className={styles.coverUploadBox}>
                  {coverUrl ? (
                    <img src={coverUrl} alt="封面" className={styles.coverThumb} />
                  ) : (
                    <Button icon={<UploadOutlined />}>上传封面图片</Button>
                  )}
                </div>
              </Upload>
            </div>
            <div className={styles.formGroup}>
              <label>所属课程</label>
              <Select
                value={saveFormData.courseId}
                onChange={v => setSaveFormData(prev => ({ ...prev, courseId: v }))}
                placeholder="请选择课程"
                style={{ width: '100%' }}
              >
                {courseList.map(c => (
                  <Option key={c.courseId} value={c.courseId}>{c.courseName}</Option>
                ))}
              </Select>
            </div>

            <div className={styles.formGroup}>
              <label>视频备注</label>
              <textarea
                name="notes"
                value={saveFormData.notes}
                onChange={handleInputChange}
                placeholder="请输入视频备注信息"
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

export default MediaResources;
