import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import ReactMarkdown from 'react-markdown';
import styles from '../../scss/knowledgeBase/useBase.module.scss';
import { 
  Send, DocDetail, Ppt, Edit, Square, User, Upload, 
  FileText, Close, Plus, MagicWand, Save, Eye, 
  BookOpen, EditPen, Sparkles, History, Delete, 
  Upload as UploadIcon, FileWord, FilePdf, Search,
  TrendingUp, TrendingDown, Api, Message
} from '@icon-park/react';
import '@icon-park/react/styles/index.css';
import { message as antMessage, Upload as AntUpload, Button, Tag, Card, Select, Input, List, Empty } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { Extension } from '@tiptap/core';
import {getKnowledgebaseList}from '../../api/knowledge'
const { TextArea } = Input;

//图标
Modal.setAppElement('#root');

const commonPhrases = [
  "请告诉我java程序设计课程是讲什么的？",
  "请告诉我java程序设计课程第一节是什么？",
  "请告诉我java程序设计课程是最后一节是什么？",
];


const UseBase = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(1);
  const [selectedBase, setSelectedBase] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { User: 'Me', content: "请帮我规划[主题]的课程内容", status: 0 },
    {
      id: Date.now() + 1,
      User: 'assistant',
      content: `
## 示例回答

这是一个 Markdown 格式的回答，可以包含：

- 列表项
- 代码块
- 表格等

\`\`\`python
def example():
    print("示例代码")
\`\`\`

| 列名1 | 列名2 |
|-------|-------|
| 内容1 | 内容2 |

> 引用文本示例

详细信息请参考[相关文档](https://example.com)`
        }
  ]);
  const [question, setQuestion] = useState("");
  const [active, setActive] = useState(true);
  const contentRef = useRef(null);
  const token = localStorage.getItem('accessToken');

  // 添加统计数据状态
  const [stats, setStats] = useState({
    totalQuestions: 0,
    answeredQuestions: 0,
    activeUsers: 0,
    responseTime: 0
  });

  // 添加知识库列表
  const [knowledgeBases, setKnowledgeBases] = useState([]);

  // 添加过滤标签
  const [filters, setFilters] = useState([
    { id: 'all', name: '全部', active: true },
    { id: 'education', name: '教育类', active: false },
    { id: 'subject', name: '学科类', active: false },
    { id: 'resource', name: '资源类', active: false }
  ]);
  
 const getBaseList =async ()=>{
    try{
    const res = await getKnowledgebaseList()
    console.log(res)
    setKnowledgeBases(res.data.data) 
  } catch (error) {
    
  } 

  }
useEffect( () => {
  getBaseList();
}, []);

  // 模拟加载统计数据
  useEffect(() => {
    setStats({
      totalQuestions: 1250,
      answeredQuestions: 1180,
      activeUsers: 328,
      responseTime: 2.5
    });
  }, []);

  // 处理过滤器点击
  const handleFilterClick = (filterId) => {
    setFilters(filters.map(filter => ({
      ...filter,
      active: filter.id === filterId
    })));
  };

  // Mock knowledge bases data
  useEffect(() => {
    setKnowledgeBases([
      { id: 1, name: '教学资源库' },
      { id: 2, name: '课程设计库' },
      { id: 3, name: '教案资源库' }
    ]);
  }, []);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [messages]);

   const handleFileUpload = async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      console.log(token)
     
    };
  
    const sendQuestion = async () => {
      if (question !== "") {
        setMessages(prevMessages => [...prevMessages, { User: 'Me', content: question, status: 0 }]);
        setQuestion("");
        setActive(false);
        try {
              setMessages(prevMessages => [...prevMessages, { User: 'assistant', content:' ', status: 0 }]);  
              const response = await fetch(`http://14.103.151.91:8080/Api/Agent/RAG/generate?IndexName=${selectedBase}&query=${question}`, {
                method: 'GET',
                headers: {
                  'satoken':token
                },
              });
              const reader = response.body.getReader();
              const decoder = new TextDecoder('utf-8');
              let assistantContent = '';
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim() !== '');
                lines.forEach(line => {
                  const cleanedLine = line.replace("data:", "").replace(/<br>/g, '\n');
                   assistantContent += cleanedLine;
                  // 实时更新最后一条 assistant 消息
                  setMessages(prevMessages => {
                    const updated = [...prevMessages];
                    // 找到最后一个 assistant 消息并更新
                    for (let i = updated.length - 1; i >= 0; i--) {
                      if (updated[i].User === 'assistant') {
                        updated[i] = { ...updated[i], content: assistantContent };
                        break;
                      }
                    }
                    return updated;
                  });
                 
                });
              }
            } catch (err) {
              console.error('Failed to fetch textbooks:', err);
            } finally {
             
            }
        setActive(true);
      } else {
        antMessage.error("问题不能为空！");
      }
    };
  
    const stop = () => {
      antMessage.error("PPT大纲正在生成中，请勿提问！");
    };

 

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h>知识库对话平台</h>
      </div>
      {/* 选择栏 */}
      <div className={styles.selectionBar}>
        <Select
          className={styles.baseSelect}
          placeholder="选择知识库"
          value={selectedBase}
          onChange={setSelectedBase}
          options={knowledgeBases.map(base => ({
            value: base.knowledgebaseId,
            label: (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Api theme="outline" size="18"/>
                <span>{base.knowledgebaseName}</span>
              </div>
            )
          }))}
        />
        <div className={styles.filters}>
          {filters.map(filter => (
            <span
              key={filter.id}
              className={`${styles.filterTag} ${filter.active ? styles.active : ''}`}
              onClick={() => handleFilterClick(filter.id)}
            >
              {filter.name}
            </span>
          ))}
        </div>
      </div>

      {/* 聊天内容区域 */}
      <div className={styles.content}>
        <div className={styles.contentHead}>
          <h>智能对话</h>
        </div>
        
        <div className={styles.Content} style={{ height: `525px`, padding: '10px', boxShadow: 'none', scrollbarWidth: 'none' }} ref={contentRef}>
          {messages.map((message, index) => (
            <div key={index}>
              {message.User === 'Me' ? (
                <div>
                  <div className={styles.statusMessage}>
                    {message.content}
                  </div>
                </div>
              ) : (
                <div>
                  <div className={styles.myMessage}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 底部输入区域 */}
      <div className={styles.bottom}>
        <div className={styles.BottomHeader}>
          <div className={styles.commonPhrases}>
            {commonPhrases.map((phrase, index) => (
              <span
                key={index}
                className={styles.phrase}
                onClick={() => setQuestion(phrase)}
              >
                {phrase}
              </span>
            ))}
          </div>
          <div className={styles.buttonGroup}>
            <AntUpload
              beforeUpload={handleFileUpload}
              showUploadList={false}
            >
              <button className={styles.uploadButton}>
                <Upload theme="outline" size="24" />
              </button>
            </AntUpload>
            {active ? (
              <button onClick={() => sendQuestion()}>
                <Send theme="outline" size="24"/>
              </button>
            ) : (
              <button onClick={() => stop()}>
                <Square theme="outline" size="24"/>
              </button>
            )}
          </div>
        </div>
        
        <div className={styles.inputArea}>
          <textarea 
            value={question} 
            onChange={(e) => setQuestion(e.target.value)} 
            placeholder="请在这里输入您的问题..."
          />
        </div>
      </div>
    </div>
  );
};

export default UseBase;
