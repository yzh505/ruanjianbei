import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Modal,
  message,
  Breadcrumb,
  Space,
  Popconfirm,
  Form,
  Input
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  HomeOutlined
} from '@ant-design/icons';
import mermaid from 'mermaid';
import ReactMarkdown from 'react-markdown';
import styles from '../../scss/detail/flowChartDe.module.scss';
import Head from '../components/head';
 import { picture_questions_url} from '../../api/courseware';

const { TextArea } = Input;

const FlowChartDe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mermaidCode, setMermaidCode] = useState('');
  const [chartData, setChartData] = useState({
        pictureId: 12,
        pictureName: "Jeffery Castro",
        pictureIntroduction: "Navicat Cloud provides a cloud service for synchronizing connections, queries, model                ",
        pictureType: "KgldnELVR0",
        createTime: "2025-07-10T02:48:07.000+00:00",
        pictureContent: "graph TD\n    A[始] --> B[打开酒店应用程序]\n    B --> C{是否已登录?}\n    C -->|是| D[进入酒店主界面]\n    C -->|否| E[显示登录界面]\n    E --> F[输入用户名和密码]\n    F --> G{验证用户名和密码}\n    G -->|成功| H[成功登录]\n    G -->|失败| I[显示错误信息]\n    I --> E\n    H --> D\n    D --> J[结束]",
        userId: 1,
        status: 669,
        ossId: 838,
        pictureViews: 361,
        pictureUrl: "https://weizixuan.oss-cn-beijing.aliyuncs.com/image/83f9b16810e92e86.png"
      });
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [Mermaid,setMermaid]= useState(''); 

   useEffect(() => {
    fetchChartDetail();
  }, []);
 const renderMermaid1 = async (code) => {
    try {
       console.log(code)
      await mermaid.parse(code);
      const { svg } = await mermaid.render('mermaid-svg-' + Date.now(), code);
      setMermaid(svg);
      console.log(code)
      return true;
    } catch (e) {
      message.error('Mermaid 语法错误，请检查输入！');
      return false;
    }
  };
  // TODO: 替换为真实API
  const fetchChartDetail = async () => {
    try {
      setLoading(true);
       const response = await picture_questions_url(id);
       setChartData(response.data.data);
       setMermaidCode(response.data.data.pictureContent)
       await renderMermaid1(response.data.data.pictureContent)
    } catch (error) {
      message.error('获取图表详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    editForm.setFieldsValue({
      pictureName: chartData.pictureName,
      pictureIntroduction: chartData.pictureIntroduction,
      pictureContent: chartData.pictureContent
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      // await updateFlowChart(id, values);
      message.success('更新成功');
      setEditModalVisible(false);
      fetchChartDetail();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleDelete = async () => {
    try {
      // await deleteFlowChart(id);
      message.success('删除成功');
      navigate('/Mange/category/flowChart');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleDownload = () => {
    // TODO: 实现下载逻辑
    message.info('下载功能待实现');
  };

  return (
    <>
      <Head />
      <div className={styles.videoDetailContainer}>
        <div className={styles.header}>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/Mange/category/flowChart">图表列表</Breadcrumb.Item>
            <Breadcrumb.Item>图表详情</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className={styles.headerSection}>
          <div className={styles.titleWrapper}>
            <div level={2} className={styles.mainTitle}>{chartData?.pictureName || '图表详情'}</div>
            <div className={styles.subtitle}>
              高效管理图表，支持结构化内容，便于教学与展示。
            </div>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>89</span>
              <span className={styles.statLabel}>总图表数</span>
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
          <div className={styles.videoSection}>
            {Mermaid && (
              <Card className={styles.transcriptCard} title="图表内容">
               <div className={styles.flowChart}>
                <div dangerouslySetInnerHTML={{ __html: Mermaid }} />
              </div>
            </Card>
              
              
            )}
            <div className={styles.videoActions}>
              <Space>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  disabled={!chartData}
                  onClick={handleDownload}
                >
                  下载图表
                </Button>
                <Button icon={<EditOutlined />} onClick={handleEdit}>
                  编辑
                </Button>
                <Popconfirm
                  title="确定要删除这个图表吗？"
                  onConfirm={handleDelete}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button icon={<DeleteOutlined />} danger>
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            </div>
          </div>
          <div className={styles.infoSection}>
            <Card className={styles.infoCard}>
              <div className={styles.title}>图表信息</div>
               <div className={styles.infoItem}>
                <label>名称：</label>
                <span>{chartData?.pictureName}</span>
              </div>
              <div className={styles.infoItem}>
                <label>创建时间：</label>
                <span>{chartData?.createTime?.split('T')[0]}</span>
              </div>
              <div className={styles.infoItem}>
                <label>浏览量：</label>
                <span>{chartData?.pictureViews || 0}</span>
              </div>
            </Card>
              <Card className={styles.descCard} title="图表简介">
              {chartData?.pictureContent ? (
                <div className={styles.descContent}>
                  <ReactMarkdown>{chartData.pictureIntroduction}</ReactMarkdown>
                </div>
              ) : (
                <div className={styles.emptyText}>暂无图表正文</div>
              )}
            </Card>
            <Card className={styles.descCard} title="图表代码">
              {chartData?.pictureContent ? (
                <div className={styles.descContent}>
                  <ReactMarkdown>{chartData.pictureContent}</ReactMarkdown>
                </div>
              ) : (
                <div className={styles.emptyText}>暂无图表正文</div>
              )}
            </Card>
          </div>
        </div>
        <Modal
          title="编辑图表信息"
          open={editModalVisible}
          onOk={handleEditSubmit}
          onCancel={() => setEditModalVisible(false)}
          className={styles.editModal}
        >
          <Form form={editForm} layout="vertical">
            <Form.Item
              name="pictureName"
              label="图表名称"
              rules={[{ required: true, message: '请输入图表名称' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="pictureIntroduction"
              label="图表简介"
            >
              <TextArea rows={3} />
            </Form.Item>
            <Form.Item
              name="pictureContent"
              label="图表正文"
            >
              <TextArea rows={8} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default FlowChartDe;
