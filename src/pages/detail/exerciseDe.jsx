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
  Input
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
  HomeOutlined
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import styles from '../../scss/detail/videoDe.module.scss';
import Head from '../components/head'
import { getVideoDetail, updateVideo, deleteVideo } from '../../api/video';

const { TextArea } = Input;

const VideoDe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchVideoDetail();
  }, [id]);

  const fetchVideoDetail = async () => {
    try {
      setLoading(true);
    //  const response = await getVideoDetail(id);
     // setVideoData(response.data);
    } catch (error) {
      message.error('获取视频详情失败');
    } finally {
      setLoading(false);
    }
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

      <Card
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
          <div className={styles.transcriptContent}>
            <p>{videoData.videoText}</p>
          </div>
        ) : (
          <div className={styles.emptyText}>暂无音频文本数据</div>
        )}
      </Card>
    </div>
  );

  const renderInfoSection = () => (
    <div className={styles.infoSection}>
      <Card className={styles.infoCard}>
        <div className={styles.title}>视频信息</div>
        <div className={styles.statGrid}>
          <Statistic
            title="视频时长"
            value={videoData?.videoDuration || '-'}
            prefix={<ClockCircleOutlined />}
          />
          <Statistic
            title="观看次数"
            value={videoData?.videoViews || 0}
            prefix={<EyeOutlined />}
          />
          <Statistic
            title="收藏数"
            value={videoData?.collects || 0}
            prefix={<StarOutlined />}
          />
          <Statistic
            title="播放数"
            value={videoData?.views || 0}
            prefix={<PlayCircleOutlined />}
          />
        </div>
        <div className={styles.infoItem}>
          <label>视频名称：</label>
          <span>{videoData?.videoName}</span>
        </div>
        <div className={styles.infoItem}>
          <label>上传时间：</label>
          <span>{videoData?.sendTime?.split('T')[0]}</span>
        </div>
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

      <Card className={styles.timelineCard} title="知识点分片">
        {videoData?.parsedKnowledgePoints?.length > 0 ? (
          <Timeline>
            {videoData.parsedKnowledgePoints.map((point, index) => (
              <Timeline.Item key={index}>
                <p className={styles.timeRange}>时间节点: {point.startTime}s</p>
                <p className={styles.timeContent}>{point.text}</p>
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <div className={styles.emptyText}>暂无知识点分片数据</div>
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
            <Breadcrumb.Item href="/Mange/category/exercise">视频列表</Breadcrumb.Item>
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
