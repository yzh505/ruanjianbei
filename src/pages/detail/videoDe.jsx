import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Modal,
  message,
  Breadcrumb,
  Statistic,
  Timeline,
  Space,
  Popconfirm,
  Form,
  Input,
  
} from 'antd';
import {
  PlayCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  CopyOutlined,
  StarOutlined,
  HomeOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';

import ReactMarkdown from 'react-markdown';
import styles from '../../scss/detail/videoDe.module.scss';
import Head from '../components/head'
import { getVideoInformation, updateVideo, deleteVideo } from '../../api/video';
import MindMap from '../components/mindMap';
import html2canvas from 'html2canvas';
const { TextArea } = Input;

const VideoDe = () => {
  const params = useParams();
  const id = params.id || 'select';
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [zoom, setZoom] = useState(1);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1.5);
  useEffect(() => {
    fetchVideoDetail();
  }, [id]);
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
  const fetchVideoDetail = async () => {
    try {
      setLoading(true);
      const result= await getVideoInformation(id);
      const res=result.data.data;
      console.log(res.data)

       let parsedKnowledgePoints = [];
      if (res.videoSliver && typeof res.videoSliver === 'string') {
        // 尝试将字符串转为数组对象
        const arr = res.videoSliver.match(/KnowledgePointVo\((.*?)\)/g);
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
      }
      console.log(parsedKnowledgePoints)
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
      message.error('获取视频详情失败');
    } finally {
      setLoading(false);
    }
  };
  const [content, setContent] = useState( [
      {
          "entity1": "基因工程",
          "ship": "基于",
          "entity2": "生物化学"
      },
      {
          "entity1": "基因工程",
          "ship": "应用领域",
          "entity2": "创造符合人类需要的产品"
      },
      {
          "entity1": "基因工程",
          "ship": "应用领域",
          "entity2": "解决常规方法不能解决的问题"
      },
      {
          "entity1": "基因工程",
          "ship": "基本操作程序",
          "entity2": "通过不同方法得到目的基因"
      },
      {
          "entity1": "基因工程",
          "ship": "基本操作程序",
          "entity2": "将目的基因与基因表达所需的多种元件组装构成表达载体"
      },
      {
          "entity1": "基因工程",
          "ship": "基本操作程序",
          "entity2": "将表达载体导入受体细胞"
      },
      {
          "entity1": "基因工程",
          "ship": "相关技术",
          "entity2": "蛋白质工程"
      },
      {
          "entity1": "蛋白质工程",
          "ship": "产生背景",
          "entity2": "基因工程只能生产自然界已存在的蛋白质，不一定完全符合人类生产和生活的需要"
      },
      {
          "entity1": "蛋白质工程",
          "ship": "技术手段",
          "entity2": "基因修饰"
    },
  ]);

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
  const handleEdit = () => {
    editForm.setFieldsValue({
      videoName: videoData.videoName,
      videoIntroduction: videoData.videoIntroduction
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      //await updateVideo(id, values);
      message.success('更新成功');
      setEditModalVisible(false);
      fetchVideoDetail();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleDelete = async () => {
    try {
     // await deleteVideo(id);
      message.success('删除成功');
      navigate('/video/list');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCopyText = () => {
    if (videoData?.videoText) {
      navigator.clipboard.writeText(videoData.videoText);
      message.success('文本已复制到剪贴板');
    }
  };

  const renderVideoSection = () => (
    <div className={styles.videoSection}>
      <video
        className={styles.videoPlayer}
        controls
        src={videoData?.videoUrl}
        poster={videoData?.thumbnail}
      />
      <div className={styles.videoActions}>
        <Space>
          <Button icon={<EditOutlined />} onClick={handleEdit}>
            编辑视频
            </Button>
          <Popconfirm
            title="确定要删除这个视频吗？"
            onConfirm={handleDelete}
            okText="确定"
            cancelText="取消"
          >
            <Button icon={<DeleteOutlined />} danger>
              删除视频
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <div
        className={styles.transcriptCard}
        title={
          <div className={styles.transcriptHeader}>
            <span>音频文本</span>
            <Space>
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={handleCopyText}
                disabled={!videoData?.videoText}
              >
                复制全文
              </Button>
              <Button
                type="text"
                icon={<DownloadOutlined />}
                disabled={!videoData?.videoText}
              >
                导出文本
              </Button>
            </Space>
                  </div>
        }
      >
        {videoData?.videoText ? (
          <div className={styles.transcriptContent} style={{maxHeight:'600px'}}>
            <p>  {videoData.videoText}</p>
                    </div>
        ) : (
          <div className={styles.emptyText}>暂无音频文本数据</div>
        )}
      </div>

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
      
                      </div>
  );

  const renderInfoSection = () => (
    <div className={styles.infoSection}>
      <Card title="知识点分片" className={styles.timelineCard} style={{maxHeight:'1400px'}}>
        {videoData?.parsedKnowledgePoints && videoData.parsedKnowledgePoints.length > 0 ? (
          <Timeline>
            {videoData.parsedKnowledgePoints.map((slice, index) => (
              <Timeline.Item key={index}>
                <p className={styles.timeRange}>时间节点:{slice.startTime}</p>
                <p className={styles.timeContent}>{slice.text}</p>
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <div className={styles.emptyText}>暂无知识点分片数据</div>
        )}
      </Card>

      <Card className={styles.summaryCard} title="视频总结">
        {videoData?.videoSummary ? (
          <div className={styles.summaryContent}>
            <ReactMarkdown>{videoData.videoSummary}</ReactMarkdown>
            </div>
        ) : (
          <div className={styles.emptyText}>暂无视频总结</div>
        )}
      </Card>

      
    </div>
  );

  return (
    <>
      <Head/>
      <div className={styles.videoDetailContainer}>
        <div className={styles.header}>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/Mange/category/video">视频列表</Breadcrumb.Item>
            <Breadcrumb.Item>视频详情</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className={styles.headerSection}>
          <div className={styles.titleWrapper}>
            <div level={2} className={styles.mainTitle}>我的视频 </div>
            <diV className={styles.subtitle}>
              更高效的资源管理，让教学素材一目了然。智能分类、快速检索，助力教学工作更轻松。
            </diV>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>89</span>
              <span className={styles.statLabel}>总资源数</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>12</span>
              <span className={styles.statLabel}>本周新增</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>256</span>
              <span className={styles.statLabel}>使用次数</span>
            </div>
          </div>
        </div>
        <div className={styles.mainContent}>
          {renderVideoSection()}
          {renderInfoSection()}
        </div>
  
        <Modal
          title="编辑视频信息"
          open={editModalVisible}
          onOk={handleEditSubmit}
          onCancel={() => setEditModalVisible(false)}
          className={styles.editModal}
        >
          <Form form={editForm} layout="vertical">
            <Form.Item
              name="videoName"
              label="视频名称"
              rules={[{ required: true, message: '请输入视频名称' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="videoIntroduction"
              label="视频简介"
            >
              <TextArea rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  
  );
};

export default VideoDe;
