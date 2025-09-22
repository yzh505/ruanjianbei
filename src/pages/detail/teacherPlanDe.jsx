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
import styles from '../../scss/detail/teacherPlanDe.module.scss';
import Head from '../components/head';
import Edit from '../components/edit'
import { style } from 'd3-selection';
import { get_textResource} from '../../api/courseware';


const { TextArea } = Input;

const TeacherPlanDe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [planData, setPlanData] = useState({
        textId: 15,
        textType: "teachingplan",
        userId: 80,
        textName: "教案1",
        textIntroduction: "七月十日教案，《背影》文章教案",
        createTime: "2025-07-09T20:36:02.000+00:00",
        textUrl: null,
        textContent: `---\n### 教案名称：数据库SQL语句基础教学  \n**学科**：信息技术 / 数据库基础  \n**年级**：高中（或中职）  \n**课时**：1课时（45分钟）  \n\n---\n\n## 一、教学目标\n\n### 知识与技能\n- 学生能够理解SQL语言的基本概念及其作用。\n- 学生能够掌握常用的SQL语句，包括\`SELECT\`、\`INSERT INTO\`、\`UPDATE\`和\`DELETE\`。\n- 学生能够根据实际需求编写简单的SQL查询语句。\n\n### 过程与方法\n- 通过案例讲解和课堂练习，学生逐步掌握SQL语句的使用方法。\n- 培养学生的逻辑思维能力，学会如何从数据表中提取信息。\n\n### 情感态度与价值观\n- 激发学生对数据库技术的兴趣。\n- 培养学生严谨的逻辑思维习惯和解决问题的能力。\n\n---\n\n## 二、教学重点与难点\n\n### 教学重点\n- SQL语句的基本语法及常用命令。\n- \`SELECT\`语句的使用方法。\n\n### 教学难点\n- \`WHERE\`条件子句的灵活运用。\n- 多表关联查询的初步认识（可选拓展内容）。\n\n---\n\n## 三、教学准备\n\n### 教师准备\n- 安装好MySQL或其他数据库管理工具。\n- 准备演示用的数据表（如学生表、课程表等）。\n- 制作PPT课件，包含SQL语句示例和练习题。\n\n### 学生准备\n- 安装数据库软件（如MySQL Workbench），并熟悉基本操作。\n- 预习SQL语句的基础知识。\n\n---\n\n## 四、教学过程\n\n### 1. 导入新课（5分钟）\n- **情境引入**：展示一个学校成绩管理系统界面，引导学生思考如何从系统中获取特定学生的成绩。\n- **提问互动**：你知道这些数据是如何被存储和查询的吗？\n- **引出主题**：今天我们将学习如何使用SQL语句来操作数据库中的数据。\n\n---\n\n### 2. 新授内容（20分钟）\n\n#### （1）SQL简介（5分钟）\n- 解释SQL（Structured Query Language）的概念。\n- 展示SQL在数据库中的作用：增删改查（CRUD）操作。\n\n#### （2）常用SQL语句讲解（15分钟）\n- **SELECT语句**：用于查询数据。\n  `,
        status: 0,
        ossId: null,
        textViews: 0,
        textPicture: "https://weizixuan.oss-cn-beijing.aliyuncs.com/a3aedacc-0fbf-48da-b75d-6eb43c3b21b2.png"
      });
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchPlanDetail();
  }, [id]);

  // TODO: 替换为真实API
  const fetchPlanDetail = async () => {
    try {
      setLoading(true);
       const response = await get_textResource(id);
       setPlanData(response.data.data);
    } catch (error) {
      message.error('获取教案详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    editForm.setFieldsValue({
      textName: planData.textName,
      textIntroduction: planData.textIntroduction,
      textContent: planData.textContent
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      // await updateTeacherPlan(id, values);
      message.success('更新成功');
      setEditModalVisible(false);
      fetchPlanDetail();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleDelete = async () => {
    try {
      // await deleteTeacherPlan(id);
      message.success('删除成功');
      navigate('/Mange/category/teacherPlan');
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
            <Breadcrumb.Item href="/Mange/category/teacherPlan">教案列表</Breadcrumb.Item>
            <Breadcrumb.Item>教案详情</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className={styles.headerSection}>
          <div className={styles.titleWrapper}>
            <div level={2} className={styles.mainTitle}>{planData?.textName || '教案详情'}</div>
            <div className={styles.subtitle}>
              高效管理教案，支持markdown格式，结构清晰，便于教学参考与复用。
            </div>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>89</span>
              <span className={styles.statLabel}>总教案数</span>
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
            <Edit content={planData.textContent}/>
          </div>
          <div className={styles.infoSection}>
            <Card className={styles.infoCard}>
              <div className={styles.title}>教案信息</div>
              <div className={styles.infoItem}>
                <label>创建时间：</label>
                <span>{planData?.createTime?.split('T')[0]}</span>
              </div>
              <div className={styles.infoItem}>
                <label>浏览量：</label>
                <span>{planData?.textViews || 0}</span>
              </div>
            </Card>
            <Card className={styles.descCard} title="教案正文">
              {planData?.textPicture ? (
                <div className={styles.descContent}>
                  <img src={planData.textPicture} className={styles.sideImage}/>
                </div>
              ) : (
                <div className={styles.emptyText}>暂无教案正文</div>
              )}
            </Card>
          </div>
        </div>
        <Modal
          title="编辑教案信息"
          open={editModalVisible}
          onOk={handleEditSubmit}
          onCancel={() => setEditModalVisible(false)}
          className={styles.editModal}
        >
          <Form form={editForm} layout="vertical">
            <Form.Item
              name="textName"
              label="教案名称"
              rules={[{ required: true, message: '请输入教案名称' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="textIntroduction"
              label="教案简介"
            >
              <TextArea rows={3} />
            </Form.Item>
            <Form.Item
              name="textContent"
              label="教案正文"
            >
              <TextArea rows={8} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default TeacherPlanDe;
