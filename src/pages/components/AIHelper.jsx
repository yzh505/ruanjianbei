import React, { useState, useRef, useEffect } from 'react';
import styles from '../../scss/components/AIHelper.module.scss'; // 确保导入 SCSS 文件
import { useRequest} from '../../hooks/useRequest';
import { useParams,useNavigate } from 'react-router-dom';
import { Card, Select, Input, Button, message, Space, List, Empty, Upload, Dropdown } from 'antd';
//图标
import ReactMarkdown from 'react-markdown';
import {Home,BachelorCap,Robot,FolderClose,Ranking,CalendarThirtyTwo,SettingTwo,Remind,MessageOne,User,CloseSmall,Send,Voice,FileText,AddPicture} from '@icon-park/react'
import '@icon-park/react/styles/index.css'
import AvatarPlatform,{PlayerEvents,SDKEvents,} from '../../lib/avatar-sdk-web_3.1.2.1002/index.js'
import {textChat} from '../../api/user'
const AIHelper = () => {
  
  const { sendRequest} = useRequest();
  const navigate = useNavigate(); // 初始化 navigate
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 控制下拉框
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false); // 控制AI抽屉
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', content: '你好！我是你的AI助手，有什么需要帮助的吗？' }
  ]); // AI对话历史
  const [userInput, setUserInput] = useState(''); // 用户输入
  const [isAiThinking, setIsAiThinking] = useState(false); // AI思考状态
  const [isListening, setIsListening] = useState(false); // 语音输入状态
  const userInfo =JSON.parse(localStorage.getItem('user')) ;
  const [speechRecognition, setSpeechRecognition] = useState(null); // 语音识别实例
  const [uploadedFiles, setUploadedFiles] = useState([]); // 上传的文件列表
  const fileInputRef = useRef(null); // 文件输入引用
  const imageInputRef = useRef(null); // 图片输入引用
  const messageEndRef = useRef(null); // 用于自动滚动到最新消息
  const [selectedCourse, setSelectedCourse] = useState('');
  const courseOptions = [
    { label: '语文', value: 'chinese' },
    { label: '数学', value: 'math' },
    { label: '英语', value: 'english' },
    { label: '物理', value: 'physics' },
    { label: '化学', value: 'chemistry' },
    { label: '生物', value: 'biology' },
    { label: '历史', value: 'history' },
    { label: '地理', value: 'geography' },
    { label: '政治', value: 'politics' },
  ];
  
  const { name } = useParams();

  const [isOpenAvatar, setIsOpenAvatar] = useState(false);
  const [isAvatarMode, setIsAvatarMode] = useState(false);
  const [avatarMessages, setAvatarMessages] = useState([]);
  const [avatarInput, setAvatarInput] = useState('');


  // 初始化语音识别
  useEffect(() => {
    // 检查浏览器是否支持语音识别
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN'; // 设置语言为中文

      // 当有语音识别结果时
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setUserInput(transcript);
      };

      // 当语音识别结束时
      recognition.onend = () => {
        setIsListening(false);
      };

      // 当出现错误时
      recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        setIsListening(false);
      };

      setSpeechRecognition(recognition);
    } else {
      console.warn('你的浏览器不支持语音识别功能');
    }

    // 组件卸载时清理
    return () => {
      if (speechRecognition) {
        speechRecognition.stop();
      }
    };
  }, []);

  // 开始语音输入
  const startVoiceInput = () => {
    if (speechRecognition && !isListening && !isAiThinking) {
      setIsListening(true);
      speechRecognition.start();
    }
  };

  // 停止语音输入
  const stopVoiceInput = () => {
    if (speechRecognition && isListening) {
      speechRecognition.stop();
      setIsListening(false);
      // 如果有内容，自动发送
      if (userInput.trim()) {
        handleSendMessage();
      }
    }
  };

  // 处理文件上传
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    console.log(e.target.value)
    // 处理每个文件
    const newFiles = files.map(file => {
      // 创建文件预览URL
      const fileUrl = URL.createObjectURL(file);
      
      return {
        id: Date.now() + Math.random().toString(36).substring(2, 9), // 生成唯一ID
        name: file.name,
        type: file.type,
        size: file.size,
        file: file,
        url: fileUrl,
        isImage: file.type.startsWith('image/')
      };
    });
    
    setUploadedFiles([...uploadedFiles, ...newFiles]);
    
    // 清空文件输入以允许重新选择相同文件
    e.target.value = null;
  };
 // 文件上传配置
 const [upFile,setUpFile]=useState(null)
  const uploadProps = {
  name: 'file',
  multiple: false,
  maxSize: 10 * 1024 * 1024, // 10MB
  showUploadList: false,
  beforeUpload: (file) => {
    const fileUrl = URL.createObjectURL(file);
    const fileObj = {
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      file: file,
      url: fileUrl,
      isImage: file.type.startsWith('image/')
    };
    setUploadedFiles(prev => [...prev, fileObj]);
    setUpFile(file);
    return false; // 阻止自动上传
  }
};
  // 触发文件选择对话框
  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  // 触发图片选择对话框
  const triggerImageSelect = () => {
    imageInputRef.current.click();
  };

  // 移除上传的文件
  const removeFile = (fileId) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };



  // 打开/关闭AI抽屉
  const toggleAIDrawer = () => {
    setIsAIDrawerOpen(!isAIDrawerOpen);
    setIsAvatarMode(false);
  };

  // 处理用户输入变化
  const handleUserInputChange = (e) => {
    setUserInput(e.target.value);
  };
const token = localStorage.getItem('accessToken');
  // 处理用户消息发送
  const handleSendMessage = async () => {
    if (!userInput.trim() && uploadedFiles.length === 0) return;
    
    // 构建消息内容
    const messageContent = userInput.trim();
    let hasFiles = uploadedFiles.length > 0;
    console.log(messageContent)
    // 添加用户消息到对话历史
    const newUserMessage = { 
      role: 'user', 
      content: messageContent,
      files: hasFiles ? [...uploadedFiles] : []
    };
    const newAiMessage = { role: 'assistant', content: '' };
    setAiMessages([...aiMessages, newUserMessage,newAiMessage]);
    setUserInput('');
    setUploadedFiles([]);
    setIsAiThinking(true);
    
    try {
      const fileData =new FormData();
      fileData.append('file',upFile)
      try {
      const response = await fetch(`http://14.103.151.91:8080/Api/Agent/self-planning/selfPlan?userPrompt=${encodeURIComponent(messageContent)}&courseId=${8}&userId=${userInfo.uid}`, {
        method: 'POST',
        headers: {
          'satoken': token
        },
        body:fileData
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
          if(isAvatarMode){ 
            let sentence=buildSentence(cleanedLine);
            if(sentence!=null){
              console.log(sentence)
              avatarPlatform.writeText(sentence, {
                  nlp: false
              }).catch(e => {
                  console.error("writeText failed", e);
              });
            }
          }
          setAiMessages(prevMessages => {
            const updated = [...prevMessages];
            // 找到最后一个 assistant 消息并更新
            for (let i = updated.length - 1; i >= 0; i--) {
              if (updated[i].role === 'assistant') {
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
    }
    } catch (error) {
      console.error('AI响应出错:', error);
      // 添加错误消息
      const errorMessage = { role: 'assistant', content: `` };
    } finally {
      setIsAiThinking(false);
    }
  };

  const read =async()=>{
    avatarPlatform.writeText("你好", {
        nlp: false
    }).catch(e => {
        console.error("writeText failed", e);
    });
  }

  // 处理按键事件（按Enter发送消息）
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 消息列表自动滚动到底部
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);
   
  
  const wrapperRef = useRef(null); // 用于自动滚动到最新消息
 const avatarPlatform = new AvatarPlatform()
 avatarPlatform
    .setApiInfo({
        appId: '1ea96ebe',
        apiKey: '6722660ba549b0125ed699daf21dbd04',
        apiSecret: 'MWI4ZDk3ZmNjMzNjYjkwZjMwOTY2ZmYw',
        sceneId: '205888424958365696',
        serverUrl: 'wss://avatar.cn-huadong-1.xf-yun.com/v1/interact'
    })
    .setGlobalParams({
        stream: {
            protocol: 'xrtc',
            alpha: 1,
        },
        avatar: {
            avatar_id: '138801001',
            width: 400,
            height: 1180,
        },
        tts: {
            vcn: 'x4_yezi',
        }
    });
  const stopSpeak = async () => {
    avatarPlatform.writeText("要结束了嘛，真的很舍不得！！！", {
        nlp: false
    }).then(()=>{
      avatarPlatform.stop()
    }).catch(e => {
        console.error("writeText failed", e);
    });
    ;
  };
  
  const startAvataarPlarform = () => {
    setIsOpenAvatar(true);
    setIsAvatarMode(true);
  };
  // 消息列表自动滚动到底部
 
  // 监听数字人模式状态变化，确保wrapperRef存在后再启动
  useEffect(() => {
    if (isAvatarMode && isOpenAvatar && wrapperRef.current) {
      // 启动数字人平台
      avatarPlatform
        .start({
          wrapper: wrapperRef.current
        })
        .then(() => {
          avatarPlatform.writeText("你好，我是你的教学资源助手。有什么需要帮助的吗。", {
            nlp: false
          }).catch(e => {
            console.error("writeText failed", e);
          });
        })
        .catch(e => {
          console.error("Avatar start failed", e);
        });
    }
  }, [isAvatarMode, isOpenAvatar]);

  /**
 * 将词逐个拼接成完整句子
 * @param word            当前拿到的词
 * @param mustReturn      当本轮拿不到结束标点时，是否立即返回已累积内容（默认 false）
 * @returns               若本轮拼出完整句子则返回该句子，否则返回 null
 */
  let sentBuffer = ''; // 模块级缓存，等价于 JS 中的闭包变量

/**
 * 将词逐个拼接成完整句子
 * @param {string} word 当前拿到的词
 * @param {boolean} mustReturn 当本轮拿不到结束标点时，是否立即返回已累积内容（默认 false）
 * @returns {string|null} 若本轮拼出完整句子则返回该句子，否则返回 null
 */
  function buildSentence(word, mustReturn = false) {
    const text = sentBuffer + word;
    // 找出最后一个结束标点
    const endRe = /[.!?。！？……；：]/g;
    let lastIndex = -1;
    let match;
    while ((match = endRe.exec(text))) {
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex !== -1) {
      // 找到完整句子
      const sentence = text.slice(0, lastIndex);
      sentBuffer = text.slice(lastIndex); // 剩余内容作为下一句话的开头
      return sentence;
    }
    // 没找到结束标点
    if (mustReturn) {
      sentBuffer = '';
      return text;
    }
    // 继续累积
    sentBuffer = text;
    return null;
  }

  const stopAvatarPlatform = () => {
    setIsOpenAvatar(false);
    setIsAvatarMode(false);
    stopSpeak();
  };

  const handleAvatarSendMessage = () => {
    if (avatarInput.trim()) {
      const newMessage = {
        id: Date.now(),
        content: avatarInput,
        role: 'user',
        timestamp: new Date()
      };
      setAvatarMessages(prev => [...prev, newMessage]);
      setAvatarInput('');
      
      // 这里可以添加发送消息到数字人平台的逻辑
      // 模拟AI回复
      setTimeout(() => {
        const aiReply = {
          id: Date.now() + 1,
          content: '这是数字人的回复消息',
          role: 'ai',
          timestamp: new Date()
        };
        setAvatarMessages(prev => [...prev, aiReply]);
      }, 1000);
    }
  };

  const handleAvatarKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAvatarSendMessage();
    }
  };

/*useEffect(() => {
  startAvataarPlarform();
}, []); */

  return (
    <div className={`${styles.aiHelper} ${isAvatarMode ? styles.avatarMode : ''}`}>
      {/* AI助手悬浮球 */}
      <div 
        className={`${styles.aiFloatingButton} ${isAIDrawerOpen ? styles.active : ''}`}
        onClick={toggleAIDrawer}
        style={{ display: isAvatarMode ? 'none' : 'flex' }}
      >
        <Robot theme="filled" size="24" fill="#fff" />
      </div>

      {/* 数字人模式布局 */}
      {isAvatarMode && (
        <div className={styles.avatarModeLayout}>
          {/* 左侧数字人显示窗口 */}
          <div className={styles.avatarWindow}>
            <div className={styles.avatarTitle}>数字人助手</div>
            <div className={styles.avatarContainer} >
              <div className={styles.wrapper} ref={wrapperRef}></div>
            </div>
            <div className={styles.avatarControls}>
              <button className={styles.controlBtn} onClick={startAvataarPlarform}>
                开始
              </button>
              <button className={styles.controlBtn} onClick={stopAvatarPlatform}>
                停止
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI对话抽屉 */}
      <div className={`${styles.aiDrawer} ${isAIDrawerOpen ? styles.open : ''}`} style={{  height:isAvatarMode ? '100%' : '100vh' ,borderRadius:'0 20px 0 0',width:isAvatarMode ? '850px' : '' }}>
        <div className={styles.aiDrawerHeader} style={{borderRadius:isAIDrawerOpen&&'0 20px 0 0'}} >
          <div className={styles.aiDrawerTitle}>
            <Robot theme="filled" size="20" />
            <span>AI助手</span>
          </div>
          <div className={styles.avatarBtnGroup}>
            <h>数字人：</h>
            <button className={styles.avatarStartBtn} onClick={startAvataarPlarform}>开始</button>
            <button className={styles.avatarStopBtn} onClick={()=>{stopSpeak();setIsOpenAvatar(false);}} >停止</button>
            <button className={styles.aiDrawerClose} onClick={toggleAIDrawer}>
              <CloseSmall theme="outline" size="20" />
            </button>
          </div>
        </div>
      
        <div className={styles.aiMessageContainer}>
          {aiMessages.map((message, index) => (
            <div 
              key={index} 
              className={`${styles.aiMessage} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
            >
              {message.role === 'user' ? (
                <div className={styles.messageAvatar}>
                  <User theme="filled" size="18" />
                </div>
              ) : (
                <div className={styles.messageAvatar}>
                  <Robot theme="filled" size="18" />
                </div>
              )}
              <div className={styles.messageContent}>
                {message.role === 'user' ?message.content:<ReactMarkdown>{message.content}</ReactMarkdown>}
                
                {message.files && message.files.length > 0 && (
                  <div className={styles.messageFiles}>
                    {message.files.map(file => (
                      <div key={file.id} className={styles.messageFile}>
                        {file.isImage ? (
                          <div className={styles.imagePreview}>
                            <img src={file.url} alt={file.name} />
                          </div>
                        ) : (
                          <div className={styles.fileInfo}>
                            <FileText theme="filled" size="16" />
                            <span>{file.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isAiThinking && (
            <div className={`${styles.aiMessage} ${styles.assistantMessage}`}>
              <div className={styles.messageAvatar}>
                <Robot theme="filled" size="18" />
              </div>
              <div className={styles.messageContent}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>
        {/* 课程选择框 */}
        <div className={styles.courseSelectRow}>
          <select
            id="ai-course-select"
            className={styles.courseSelect}
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
          >
            <option value="">请选择课程</option>
            {courseOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        
        {/* 文件上传预览区域 */}
        {uploadedFiles.length > 0 && (
          <div className={styles.filePreviewArea}>
            <div className={styles.filePreviewHeader}>
              <span>已选择 {uploadedFiles.length} 个文件</span>
              <button 
                className={styles.clearFiles}
                onClick={() => setUploadedFiles([])}
              >
                清除全部
              </button>
            </div>
            <div className={styles.filePreviewList}>
              {uploadedFiles.map(file => (
                <div key={file.id} className={styles.filePreviewItem}>
                  {file.isImage ? (
                    <div className={styles.imagePreviewContainer}>
                      <img src={file.url} alt={file.name} />
                      <button 
                        className={styles.removeFile}
                        onClick={() => removeFile(file.id)}
                      >
                        <CloseSmall theme="filled" size="16" />
                      </button>
                    </div>
                  ) : (
                    <div className={styles.filePreviewContainer}>
                      <FileText theme="filled" size="24" />
                      <div className={styles.fileDetails}>
                        <span className={styles.fileName}>{file.name}</span>
                        <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                      </div>
                      <button 
                        className={styles.removeFile}
                        onClick={() => removeFile(file.id)}
                      >
                        <CloseSmall theme="filled" size="16" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className={styles.aiInputContainer}>
          {/* 文件上传按钮 */}
          <div className={styles.uploadButtons}>
            <Upload
              {...uploadProps}
              className={styles.uploadButton}
              disabled={isAiThinking}
            >
              <FileText theme="outline" size="20" />
            </Upload>
            <Upload 
             {...uploadProps}
              className={styles.uploadButton}
              disabled={isAiThinking}
            >
              <AddPicture theme="outline" size="20"/>
            </Upload>
          </div>
          
          <textarea 
            className={styles.aiInput}
            placeholder="输入你的问题..."
            value={userInput}
            onChange={handleUserInputChange}
            onKeyPress={handleKeyPress}
          />
          <button 
            className={`${styles.aiVoiceButton} ${isListening ? styles.listening : ''}`}
            onMouseDown={startVoiceInput}
            onMouseUp={stopVoiceInput}
            onTouchStart={startVoiceInput}
            onTouchEnd={stopVoiceInput}
            disabled={isAiThinking}
          >
            <Voice theme="filled" size="20" />
            {isListening && (
              <span className={styles.listeningWaves}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            )}
          </button>
          <button 
            className={styles.aiSendButton}
            onClick={handleSendMessage}
            disabled={(userInput.trim() === '' && uploadedFiles.length === 0) || isAiThinking}
          >
            <Send theme="filled" size="20" />
          </button>
        </div>
      </div>
      
      {/* 隐藏的文件输入 */}
      <input
        type="file"
        id="fileInput"
        style={{ display: 'none' }}
        multiple
      />
      <input
        type="file"
        id="imageInput"
        accept="image/*"
        style={{ display: 'none' }}
        multiple
      />
    </div>
  );
};

export default AIHelper;
