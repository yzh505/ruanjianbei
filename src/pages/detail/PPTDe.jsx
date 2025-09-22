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
import ReactMarkdown from 'react-markdown';
import styles from '../../scss/detail/PPTDe.module.scss';
import Head from '../components/head';
 import { get_textResource} from '../../api/courseware';

const { TextArea } = Input;

const PPTDe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pptData, setPPTData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchPPTDetail();
  }, [id]);

  // TODO: 替换为真实API
  const fetchPPTDetail = async () => {
    try {
      setLoading(true);
      const response = await get_textResource(id);
      console.log(response.data)
      // setPPTData(response.data);
      // mock data for demo
      setPPTData(response.data.data);
    } catch (error) {
      message.error('获取PPT详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    editForm.setFieldsValue({
      pptName: pptData.pptName,
      pptIntroduction: pptData.pptIntroduction,
      pptOutline: pptData.pptOutline
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      // await updatePPT(id, values);
      message.success('更新成功');
      setEditModalVisible(false);
      fetchPPTDetail();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleDelete = async () => {
    try {
      // await deletePPT(id);
      message.success('删除成功');
      navigate('/ppt/list');
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
      <div className={styles.pptDetailContainer}>
        <div className={styles.header}>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/Mange/category/PPT">PPT列表</Breadcrumb.Item>
            <Breadcrumb.Item>PPT详情</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className={styles.headerSection}>
          <div className={styles.titleWrapper}>
            <div level={2} className={styles.mainTitle}>{pptData?.pptName || 'PPT详情'} </div>
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
          <div className={styles.pptSection}>
            {pptData?.textUrl&&<iframe
               src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(pptData.textUrl)}`}
               title="PPT预览"
               className={styles.iframe}
               frameBorder="0"
               allowFullScreen
            />}
            <div className={styles.pptName}>{pptData?.pptName}</div>
            <Space style={{ marginTop: 12 }}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                disabled={!pptData}
                onClick={handleDownload}
              >
                下载PPT
              </Button>
              <Button icon={<EditOutlined />} onClick={handleEdit}>
                编辑
              </Button>
              <Popconfirm
                title="确定要删除这个PPT吗？"
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
          <div className={styles.infoSection}>
            <Card className={styles.infoCard}>
              <div className={styles.title}>PPT信息</div>
              <div className={styles.infoItem}>
                <label>名称：</label>
                <span>{pptData?.textIntroduction || '-'}</span>
              </div>
              <div className={styles.infoItem}>
                <label>上传时间：</label>
                <span>{pptData?.createTime || '-'}</span>
              </div>
              <div className={styles.infoItem}>
                <label>下载量：</label>
                <span>{pptData?.downloads || 0}</span>
              </div>
              <div className={styles.infoItem}>
                <label>浏览量：</label>
                <span>{pptData?.textViews || 0}</span>
              </div>
              <div className={styles.infoItem}>
                <label>收藏数：</label>
                <span>{pptData?.collects || 0}</span>
              </div>
            </Card>
            <Card className={styles.descCard} title="PPT介绍">
              {pptData?.textIntroduction ? (
                <div className={styles.descContent}>{pptData.textIntroduction}</div>
              ) : (
                <div className={styles.emptyText}>暂无PPT介绍</div>
              )}
            </Card>
            <Card className={styles.outlineCard} title="PPT大纲">
              {pptData?.pptOutline ? (
                <div className={styles.outlineContent}>
                  <ReactMarkdown>{pptData.pptOutline}</ReactMarkdown>
                </div>
              ) : (
                <div className={styles.emptyText}>暂无PPT大纲</div>
              )}
            </Card>
          </div>
        </div>
        <Modal
          title="编辑PPT信息"
          open={editModalVisible}
          onOk={handleEditSubmit}
          onCancel={() => setEditModalVisible(false)}
          className={styles.editModal}
        >
          <Form form={editForm} layout="vertical">
            <Form.Item
              name="pptName"
              label="PPT名称"
              rules={[{ required: true, message: '请输入PPT名称' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="pptIntroduction"
              label="PPT介绍"
            >
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name="pptOutline"
              label="PPT大纲"
            >
              <TextArea rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default PPTDe;
