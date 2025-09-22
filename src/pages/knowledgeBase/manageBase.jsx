import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Input, Modal, Form, Tabs,
  Upload, message, Card, Space, Popconfirm, Tag 
} from 'antd';
import { 
  PlusOutlined, SearchOutlined, 
  UploadOutlined, DeleteOutlined, 
  EditOutlined, FolderOpenOutlined,
  FileTextOutlined, FilePdfOutlined,
  FilePptOutlined, ClockCircleOutlined,
  CloudUploadOutlined, DownloadOutlined,
  EyeOutlined, CalendarOutlined,
  DatabaseOutlined, TeamOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import MindMap from '../components/mindMap'
import styles from '../../scss/knowledgeBase/manageBase.module.scss';
import {setupKnowledgeBase,getKnowledgebaseList,getDocumentationByKnowledgebaseId,getDocumentationById,UploadDocumentation} from '../../api/knowledge'
import ReactECharts from 'echarts-for-react';
import ReactMarkdown from 'react-markdown';

const { Search } = Input;
const { Dragger } = Upload;
const { TabPane } = Tabs;

const ManageBase = () => {
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingBase, setEditingBase] = useState(null);
  const [currentBase, setCurrentBase] = useState(null);
  const [form] = Form.useForm();
  const [zoom, setZoom] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    documents: 0,
    size: '0 MB'
  });
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [summary, setSummary] = useState('');

  const fetchData = async ()=>{
    const res = await getKnowledgebaseList();
    console.log(res)
    setKnowledgeBases(res.data.data);
  }

  // Mock data loading
  useEffect(() => {
    

    setStatistics({
      total: 5,
      active: 3,
      documents: 450,
      size: '5.8 GB'
    });
    fetchData();
  }, []);

  const columns = [
    {
      title: '知识库名称',
      dataIndex: 'knowledgebaseName',
      key: 'knowledgebaseName',
      width:'120px'
    },
    {
      title: '描述',
      dataIndex: 'knowledgebaseIntroduction',
      key: 'knowledgebaseIntroduction',
      width:'450px'
    },
    {
      title: '文档数量',
      dataIndex: 'documentCount',
      key: 'documentCount',
      width:'120px'
    },
    {
      title: '使用人数',
      dataIndex: 'useNumber',
      key: 'useNumber',
      width:'120px'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width:'250px'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<FolderOpenOutlined />}
            onClick={() => handleOpenBase(record)}
          >
            打开
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个知识库吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleOpenBase = async (base) => {
    setCurrentBase(base);
    setIsDetailModalVisible(true);
    fetchFileList(base);
  };
  const fetchFileList =async (base)=>{
   const res=await getDocumentationByKnowledgebaseId(base.knowledgebaseId);
      console.log(res.data)
      setCurrentBase({
        ...base,
        files:res.data.data
      })
  }
  const handleEdit = (base) => {
    setEditingBase(base);
    form.setFieldsValue(base);
    setIsModalVisible(true);
  };

  const handleDelete = async (base) => {
    try {
      setKnowledgeBases(prev => prev.filter(item => item.id !== base.id));
      message.success('知识库删除成功');
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingBase) {
        setKnowledgeBases(prev =>
          prev.map(item =>
            item.id === editingBase.id ? { ...item, ...values } : item
          )
        );
      } else {
        const newBase = {
          id: Date.now(),
          ...values,
          documentCount: 0,
          size: '0 MB',
          createdAt: new Date().toISOString().split('T')[0],
          files: [],
          uploadHistory: []
        };
        setKnowledgeBases(prev => [...prev, newBase]);
        const res= await setupKnowledgeBase({
            "knowledgebaseName": values.name,
            "knowledgebaseIntroduction": values.description
        })
        console.log(res)
      }
      message.success(`知识库${editingBase ? '更新' : '创建'}成功`);
      setIsModalVisible(false);
      form.resetFields();
      setEditingBase(null);
      fetchData();
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  const handleDeleteFile = (fileId) => {
    setCurrentBase(prev => ({
      ...prev,
      files: prev.files.filter(file => file.id !== fileId),
      documentCount: prev.documentCount - 1
    }));
    message.success('文件删除成功');
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
   customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const fileData = new FormData()
        fileData.append('file', file);
        const res = await UploadDocumentation(currentBase.knowledgebaseId, fileData);
        console.log(res.data.data)
        fetchFileList(currentBase)
        onSuccess();
      } catch (error) {
        onError(error);
      }
    },
    onChange(info) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} 上传成功`);
        
      }
    },
  };
  const [content,setContent]=useState('')
   const getGraphContent = (content) => {
    if (content && content.length > 0) {
      console.log(111)
      return content.map(item => ({
        entity1: item.startEntity,
        ship: item.relationship,
        entity2: item.endEntity
      }));
    }
    return content;
  };
  const openMindmap= ( ) =>{
    const res = getDocumentationById();
    console.log(res.data.data)
    
  }
  // 模拟获取知识图谱和总结
  const fetchDocPreview = async (file) => {
    // 这里可替换为实际接口
    // 知识图谱数据格式示例
    const mockGraph = {
      nodes: [
        { name: file.documentationName, category: 0 },
        { name: '概念A', category: 1 },
        { name: '概念B', category: 1 },
        { name: '知识点1', category: 2 },
        { name: '知识点2', category: 2 }
      ],
      links: [
        { source: file.documentationName, target: '概念A', value: '包含' },
        { source: file.documentationName, target: '概念B', value: '包含' },
        { source: '概念A', target: '知识点1', value: '关联' },
        { source: '概念B', target: '知识点2', value: '关联' }
      ],
      categories: [
        { name: '文档' },
        { name: '概念' },
        { name: '知识点' }
      ]
    };
    const res =await getDocumentationById(file.documentationId);
    const mockSummary = res.data.data.summary;
    console.log(res.data.data.knowledgePoint)
     let parsedKnowledgeGraph = [];
        if (res.data.data.knowledgePoint && typeof res.data.data.knowledgePoint === 'string') {
          // 尝试将字符串转为数组对象
          const arr = res.data.data.knowledgePoint.match(/RelationshipVo\((.*?)\)/g);
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
      setContent(getGraphContent(parsedKnowledgeGraph));
    setGraphData(mockGraph);
    setSummary(mockSummary);
    setPreviewDoc(file);
    setIsPreviewModalVisible(true);
  };
  const getFileIcon = (type) => {
    switch (type) {
      case 'doc':
      case 'docx':
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'pdf':
        return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
      case 'ppt':
      case 'pptx':
        return <FilePptOutlined style={{ color: '#fa8c16' }} />;
      default:
        return <FileTextOutlined />;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.head}>
        <h>知识库管理</h>
        <p>教师的专属知识库，助力教学提质增效</p>
      </div>
      <div className={styles.content}>
        <div className={styles.toolbar}>
          <Search
            className={styles.search}
            placeholder="搜索知识库"
            allowClear
            enterButton={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingBase(null);
              setIsModalVisible(true);
            }}
            className={styles.addButton}
          >
            新建知识库
          </Button>
        </div>

        <Table
          className={styles.table}
          columns={columns}
          dataSource={knowledgeBases}
          rowKey="id"
        />
      </div>

      {/* 知识库详情模态框 */}
      <Modal
        title="知识库详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        width={1000}
        footer={null}
        className={styles.baseDetailModal}
      >
        {currentBase && (
          <>
            <div className={styles.header}>
              <div className={styles.info}>
                <div className={styles.title}>{currentBase.createTime.split('T')[0]}</div>
                <div className={styles.meta}>
                  <span><CalendarOutlined /> 创建时间：{currentBase.createdAt}</span>
                  <span><TeamOutlined /> 名称：{currentBase.knowledgebaseName}</span>
                  <span><DatabaseOutlined /> 容量：{currentBase.size}</span>
                </div>
                <div className={styles.description}>{currentBase.description}</div>
              </div>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <div className={styles.label}>文档数量</div>
                  <div className={styles.value}>{currentBase.documentCount}</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.label}>使用数量</div>
                  <div className={styles.value}>{currentBase.useNumber}</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.label}>最近更新</div>
                  <div className={styles.value}>{currentBase.lastUpdated}</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.label}>存储容量</div>
                  <div className={styles.value}>{currentBase.size}</div>
                </div>
              </div>
            </div>

            <Tabs className={styles.tabs}>
              <TabPane tab="文件列表" key="1">
                <div className={styles.fileList}>
                  {currentBase.files?.map(file => (
                    <div key={file.documentationId} className={styles.fileItem}>
                      <div className={`${styles.fileType} ${styles[file.type]}`}>
                        {getFileIcon(file.type)}
                      </div>
                      <div className={styles.fileContent}>
                        <div className={styles.fileName}>{file.documentationName}</div>
                        <div className={styles.fileMeta}>
                          <span>大小：1MB</span>
                          <span>上传时间：{file.sendTime}</span>
                          <span>上传者：{file.uploader}</span>
                        </div>
                      </div>
                      <div className={styles.fileActions}>
                        <Button type="text" icon={<EyeOutlined />} onClick={()=>fetchDocPreview(file)}>
                          预览
                        </Button>
                        <Button type="text" icon={<DownloadOutlined />}>
                          下载
                        </Button>
                        <Popconfirm
                          title="确定要删除这个文件吗？"
                          onConfirm={() => handleDeleteFile(file.id)}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button type="text" danger icon={<DeleteOutlined />}>
                            删除
                          </Button>
                        </Popconfirm>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <Upload {...uploadProps}>
                    <Button icon={<CloudUploadOutlined />}>上传文件</Button>
                  </Upload>
                </div>
              </TabPane>
              <TabPane tab="上传历史" key="2">
                <div className={styles.uploadHistory}>
                  {currentBase.uploadHistory?.map(history => (
                    <div key={history.id} className={styles.historyItem}>
                      <div className={styles.fileIcon}>
                        <ClockCircleOutlined />
                      </div>
                      <div className={styles.fileInfo}>
                        <div className={styles.fileName}>{history.fileName}</div>
                        <div className={styles.fileDetails}>
                          <span>上传时间：{history.uploadTime}</span>
                          <span>上传者：{history.uploader}</span>
                          <span>大小：{history.fileSize}</span>
                          <Tag color={history.status === 'success' ? 'success' : 'error'}>
                            {history.status === 'success' ? '上传成功' : '上传失败'}
                          </Tag>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabPane>
            </Tabs>
          </>
        )}
      </Modal>

      {/* 文档预览弹窗 */}
      <Modal
        title={
          <div style={{display:'flex',alignItems:'center',gap:10,borderBottom:'1px solid #ccc',padding:'20px'}}>
            <ShareAltOutlined style={{fontSize:22,color:'#1890ff',marginRight:4}}/>
            <span style={{fontWeight:700,fontSize:18,letterSpacing:1 ,color:'#1890ff'}}>文档知识图谱预览</span>
            {previewDoc && <span style={{color:'#888',fontSize:15,marginLeft:10}}>{previewDoc.documentationName}</span>}
          </div>
        }
        open={isPreviewModalVisible}
        onCancel={() => setIsPreviewModalVisible(false)}
        width={1020}
        footer={null}
        className={styles.previewModal}
      >
        <div className={styles.previewContentVertical}>
          <div className={styles.graphSectionVertical}>
            <div className={styles.sectionTitleModern}>
              <ShareAltOutlined style={{fontSize:18,color:'#1890ff',marginRight:6}}/>
              <span>知识图谱</span>
            </div>
            <div style={{maxHeight:'400px',overflowY:'auto',scrollbarWidth:'none'}}> 
              <MindMap code={content} setCode={setContent} zoom={zoom} />
            </div>
            
          </div>
          <div className={styles.summarySectionVertical}>
            <div className={styles.sectionTitleModern}>
              <FileTextOutlined style={{fontSize:18,color:'#52c41a',marginRight:6}}/>
              <span>文档总结</span>
            </div>
            <div style={{maxHeight:'400px',overflowY:'auto',scrollbarWidth:'none'}}><ReactMarkdown>{summary}</ReactMarkdown></div>
          </div>
        </div>
      </Modal>
      {/* 编辑/创建知识库模态框 */}
      <Modal
        title={editingBase ? "编辑知识库" : "新建知识库"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingBase(null);
        }}
        onOk={form.submit}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className={styles.form}
        >
          <Form.Item
            name="name"
            label="知识库名称"
            rules={[{ required: true, message: '请输入知识库名称' }]}
          >
            <Input placeholder="请输入知识库名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入知识库描述' }]}
          >
            <Input.TextArea
              placeholder="请输入知识库描述"
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageBase;
