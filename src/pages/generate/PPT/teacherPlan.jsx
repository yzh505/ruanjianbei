import React, { useState, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import { Card, Select, Input, Button, message, Space, List, Empty, Upload, Dropdown } from 'antd';
import Modal from 'react-modal';
import { Plus, Send, Edit, FileText, MagicWand, FolderPlus, Eye, BookOpen, EditPen, Close, History, Delete, Upload as UploadIcon, FileWord, FilePdf, Search, AddPicture, Table as TableIcon, Picture } from '@icon-park/react';
import html2canvas from 'html2canvas';
import { UploadOutlined,} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { Extension } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import TableHeader from '@tiptap/extension-table-header';
import ReactMarkdown from 'react-markdown';
import styles from '../../../scss/generate/PPT/teacherPlan.module.scss';
import {textResource,saveTextResource,optimizeParagraphs} from '../../../api/courseware'; // 导入教案列表查询API
import {getKnowledgebaseList}from '../../../api/knowledge'
import {getCourseList} from '../../../api/coursedesign'
import { indexes } from 'd3';
const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

// 分段高亮扩展
const SelectedSection = Extension.create({
  name: 'selectedSection',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          isSelected: {
            default: false,
            parseHTML: element => element.getAttribute('data-selected') === 'true',
            renderHTML: attributes => {
              if (!attributes.isSelected) {
                return {}
              }
              return {
                'data-selected': 'true',
                class: styles.selectedSection
              }
            }
          }
        }
      }
    ]
  }
});

// 创建可调整大小的图片扩展
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: attributes => ({
          width: attributes.width,
        }),
      },
      height: {
        default: null,
        renderHTML: attributes => ({
          height: attributes.height,
        }),
      },
      style: {
        default: null,
        renderHTML: attributes => ({
          style: attributes.style,
        }),
      },
    }
  },
  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const container = document.createElement('div');
      container.classList.add(styles.resizableImageContainer);

      const img = document.createElement('img');
      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        img.setAttribute(key, value);
      });
      img.classList.add(styles.editorImage);

      // 添加调整大小的手柄
      const resizeHandle = document.createElement('div');
      resizeHandle.classList.add(styles.resizeHandle);

      let startX, startY, startWidth, startHeight;

      const onMouseDown = (event) => {
        event.preventDefault();
        startX = event.clientX;
        startY = event.clientY;
        startWidth = img.offsetWidth;
        startHeight = img.offsetHeight;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      };

      const onMouseMove = (event) => {
        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        const aspectRatio = startWidth / startHeight;

        // 保持宽高比
        const newWidth = Math.max(100, startWidth + deltaX);
        const newHeight = Math.max(100, newWidth / aspectRatio);

        // 直接更新样式，而不是通过编辑器命令
        img.style.width = `${newWidth}px`;
        img.style.height = `${newHeight}px`;
      };

      const onMouseUp = () => {
        // 在松开鼠标时，一次性更新节点属性
        if (typeof getPos === 'function') {
          const style = `width: ${img.style.width}; height: ${img.style.height};`;
          editor.commands.updateAttributes('image', {
            style: style
          });
        }

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      resizeHandle.addEventListener('mousedown', onMouseDown);

      container.appendChild(img);
      container.appendChild(resizeHandle);

      return {
        dom: container,
        destroy: () => {
          resizeHandle.removeEventListener('mousedown', onMouseDown);
        },
      }
    }
  },
});

const TeacherPlan = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [activeTemplateTab, setActiveTemplateTab] = useState('all');
  const token = localStorage.getItem('accessToken');
  const userInfo =JSON.parse(localStorage.getItem('user')) ;
  const [historyList, setHistoryList] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
  const [optimizedContent, setOptimizedContent] = useState('');
  const [optimizingIndex, setOptimizingIndex] = useState(null);


  const templates = [
    {
      id: 'standard',
      name: '标准教案模板',
      description: '包含教学目标、重难点、教学过程等基本要素',
      category: 'all',
      tags: ['通用', '标准化'],
      icon: '📚',
      imageUrl: 'https://weizixuan.oss-cn-beijing.aliyuncs.com/14dd2e9c-caad-4c2c-a816-6d43d3915271.png',
      uploadTime: '2024-03-20'
    },
    {
      id: 'detailed',
      name: '详细教案模板',
      description: '包含更详细的教学环节和活动设计',
      category: 'primary',
      tags: ['小学', '详细'],
      icon: '📖',
      imageUrl: 'https://weizixuan.oss-cn-beijing.aliyuncs.com/a3aedacc-0fbf-48da-b75d-6eb43c3b21b2.png',
      uploadTime: '2024-03-19'
    },
    {
      id: 'simple',
      name: '简洁教案模板',
      description: '适合快速备课的简化版教案',
      category: 'junior',
      tags: ['初中', '简洁'],
      icon: '📝',
      imageUrl: 'https://weizixuan.oss-cn-beijing.aliyuncs.com/14dd2e9c-caad-4c2c-a816-6d43d3915271.png',
      uploadTime: '2024-03-18'
    }
  ];

  // 搜索过滤函数
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeTemplateTab === 'all' || template.category === activeTemplateTab;
    return matchesSearch && matchesCategory;
  });
  // 修改编辑器配置
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        html: true,
        breaks: true,
        linkify: true,
      }),
      SelectedSection,
      Image.configure({
        HTMLAttributes: {
          class: styles.editorImage,
        },
      }),
    ],
    content: '',
    editable: true,
  });

  // 修改工具栏渲染函数
  const renderEditorToolbar = useCallback(() => (
    <div className={styles.tiptapToolbar}>
      <button onClick={() => editor && editor.chain().focus().toggleBold().run()} className={editor && editor.isActive('bold') ? styles.active : ''}><b>B</b></button>
      <button onClick={() => editor && editor.chain().focus().toggleItalic().run()} className={editor && editor.isActive('italic') ? styles.active : ''}><i>I</i></button>
      <button onClick={() => editor && editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor && editor.isActive('heading', { level: 1 }) ? styles.active : ''}>H1</button>
      <button onClick={() => editor && editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor && editor.isActive('heading', { level: 2 }) ? styles.active : ''}>H2</button>
      <button onClick={() => editor && editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor && editor.isActive('heading', { level: 3 }) ? styles.active : ''}>H3</button>
      <button onClick={() => editor && editor.chain().focus().toggleBulletList().run()} className={editor && editor.isActive('bulletList') ? styles.active : ''}>• 列表</button>
      <button onClick={() => editor && editor.chain().focus().toggleOrderedList().run()} className={editor && editor.isActive('orderedList') ? styles.active : ''}>1. 列表</button>
      <button onClick={() => editor && editor.chain().focus().toggleBlockquote().run()} className={editor && editor.isActive('blockquote') ? styles.active : ''}>&ldquo;</button>
      <button onClick={() => editor && editor.chain().focus().unsetAllMarks().run()}>清除格式</button>
      <Upload
        accept="image/*"
        showUploadList={false}
        beforeUpload={(file) => {
          handleImageUpload(file);
          return false;
        }}
      >
        <button className={styles.imageUploadBtn} disabled={imageUploading}>
          <AddPicture theme="outline" size="18" />
          {imageUploading ? '上传中...' : '插入图片'}
        </button>
      </Upload>
    </div>
  ), [editor, imageUploading]);

  // 文件上传配置
  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.doc,.docx,.pdf,.txt',
    maxSize: 10 * 1024 * 1024, // 10MB
    showUploadList: false,
    beforeUpload: (file) => {
      const isValidType = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf',
        'text/plain'
      ].includes(file.type);
      
      if (!isValidType) {
        message.error('只支持 Word、PDF 和 TXT 文件!');
        return false;
      }
      
      const isValidSize = file.size / 1024 / 1024 < 10;
      if (!isValidSize) {
        message.error('文件大小不能超过 10MB!');
        return false;
      }

      setUploadedFile(file);
      return false; // 阻止自动上传
    }
  };

  // 处理文件上传生成教案
  const handleFileGenerate = async () => {
    if (!uploadedFile) {
      message.warning('请先上传文件');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('http://14.103.151.91:8080/Api/Agent/Resources/generateFromFile', {
        method: 'POST',
        headers: {
          'satoken': token
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let content = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        content += chunk;
        setGeneratedContent(prev => prev + chunk);
      }

      message.success('教案生成成功！');
    } catch (error) {
      console.error('生成失败:', error);
      message.error('生成失败，请重试');
    } finally {
      setIsUploading(false);
      setUploadedFile(null);
    }
  };

  // 生成教案
  const handleGenerate = async () => {
    // 添加滚动到预览部分的逻辑setCurrentCourse
    setTimeout(() => {
      const previewSection = document.querySelector(`.${styles.previewSection}`);
      if (previewSection) {
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    if (!prompt) {
      message.warning('请先输入教案描述');
      return;
    }
    setGeneratedContent('');
    setIsGenerating(true);
    setCurrentCourse(selectedCourse)
    try {
      const response = await fetch(`http://14.103.151.91:8080/Api/Agent/Resources/generateTeachingPlan?usermessage=${encodeURIComponent(prompt)}${selectedKnowledge===null?'':'&knowledgebaseId='+selectedKnowledge}&courseId=${selectedCourse}`, {
        method: 'GET',
        headers: {
          'satoken':token
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (!response.body) {
        throw new Error('No response body');
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        lines.forEach(line => {
          const cleanedLine = line.replace("data:", "").replace(/<br>/g, '\n');
          const newContent=generatedContent+cleanedLine;
          setGeneratedContent(prev => prev + cleanedLine);
        });
      }
    } catch (err) {
      console.error('Failed to fetch textbooks:', err);
      message.error('生成失败，请重试');
    } finally {
      setIsGenerating(false)
    }
    setIsGenerating(false);
  };

  // 编辑教案
  const handleEditPlan = () => {
    setIsEditorOpen(true);
    setIsLeftCollapsed(true);
    const contentSections = generatedContent.split('---').filter(section => section.trim());
    setSections(contentSections);
    setSelectedSection(null);
    if (editor) {
      editor.commands.setContent(contentSections.join('\n## '));
    }
  };

  // 关闭编辑器
  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setIsLeftCollapsed(false);
  };

  // 选择分段
 const handleSectionSelect = (index) => {
    setSelectedSection(index);
    // 移除所有段落的选中状态
    const allSections = document.querySelectorAll('[data-section]');
    allSections.forEach(section => section.classList.remove(styles.selected));
    
    // 添加当前段落的选中状态
    const currentSection = document.querySelector(`[data-section="${index}"]`);
    if (currentSection) {
      currentSection.classList.add(styles.selected);
      currentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 更新编辑器内容
    if (editor) {
      const sectionsWithClass = sections.map((section, i) => {
        if (i === index) {
          // 选中的段落使用引用块格式
          const lines = section.split('\n');
          const quotedLines = lines.map(line => `> ${line}`).join('\n');
          return quotedLines;
        } else {
          // 其他段落保持原格式
          return section;
        }
      });
      const allContent = sectionsWithClass.join('\n---\n');
      editor.commands.setContent(allContent);
      
      // 等待内容更新后滚动到选中段落
      setTimeout(() => {
        const editorElement = document.querySelector('.ProseMirror');
        if (editorElement) {
          // 查找所有的blockquote元素
          const blockquotes = editorElement.querySelectorAll('blockquote');
          if (blockquotes.length > 0) {
            blockquotes[0].scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
          } else {
            editorElement.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }
        } else {
          console.log('未找到编辑器元素');
        }
      }, 100);
    }
  };

  // 保存分段
  const handleSectionSave = async () => {
    // 假设优化API为 optimizeSection(sectionText)
    if (selectedSection == null) return;
    setOptimizingIndex(selectedSection);
    setIsOptimizeModalOpen(true);
    // 这里可以调用后端API或本地算法进行优化
    // 示例：假设直接将内容加上“【优化示例】”
    const original = sections[selectedSection];
    // TODO: 替换为实际优化逻辑
    const newContent = original + '\n【优化示例】';
    try {
      const response = await fetch('http://14.103.151.91:8080/Api/Agent/Resources/optimizeParagraphs', {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json',   // 关键
          'satoken': token
        },
        body:JSON.stringify({
          usermessage:  sections[selectedSection],
          uptext:  selectedSection>0?sections[selectedSection-1]:'',
          downtext: sections[selectedSection+1]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let content = '';
      
      while (true) {
         const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        lines.forEach(line => {
          const cleanedLine = line.replace("data:", "").replace(/<br>/g, '\n');
          const newContent=generatedContent+cleanedLine;
          setOptimizedContent(prev => prev + cleanedLine);
        });
      }

      message.success('教案生成成功！');
    } catch (error) {
      console.error('生成失败:', error);
      message.error('生成失败，请重试');
    } finally {
      setIsUploading(false);
      setUploadedFile(null);
    }
  };

  const handleConfirmOptimize = () => {
    if (optimizingIndex == null) return;
    const newSections = [...sections];
    newSections[optimizingIndex] = optimizedContent;
    setSections(newSections);

    // 如果当前选中的分段就是优化的分段，则同步右侧编辑器内容
    if (selectedSection === optimizingIndex && editor) {
      // 只更新当前分段内容，其他分段保持原样
      const sectionsWithClass = newSections.map((section, i) => {
        if (i === selectedSection) {
          // 选中的段落使用引用块格式
          const lines = section.split('\n');
          const quotedLines = lines.map(line => `> ${line}`).join('\n');
          return quotedLines;
        } else {
          return section;
        }
      });
      const allContent = sectionsWithClass.join('\n---\n');
      editor.commands.setContent(allContent);
    }

    setIsOptimizeModalOpen(false);
    setOptimizedContent('');
    setOptimizingIndex(null);
  };
  const handleCancelOptimize = () => {
    setIsOptimizeModalOpen(false);
    setOptimizedContent('');
    setOptimizingIndex(null);
  };

  // 保存教案
  const handleOutlineSave = () => {
    if (editor) {
      const markdownContent = editor.storage.markdown.getMarkdown();
      setGeneratedContent(markdownContent);
      setIsEditorOpen(false);
      setIsLeftCollapsed(false);
      message.success('教案保存成功');
    }
  };
  // 处理文件下载
  const handleDownload = (format) => {
    if (!generatedContent) {
      message.warning('没有可下载的内容');
      return;
    }

    let content = '';
    let filename = '';
    let mimeType = '';

    if (format === 'html') {
      // 将Markdown转换为HTML
      const htmlContent = marked.parse(generatedContent);
      content = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>教案内容</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
            .container { max-width: 800px; margin: 40px auto; padding: 20px; }
            h1, h2, h3, h4, h5, h6 { color: #1f1f1f; margin-top: 1.5em; }
            p { color: #666; line-height: 1.8; }
            ul, ol { padding-left: 2em; }
            li { margin: 0.5em 0; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            ${htmlContent}
          </div>
        </body>
        </html>
      `;
      filename = '教案内容.html';
      mimeType = 'text/html';
    } else if (format === 'markdown') {
      content = generatedContent;
      filename = '教案内容.md';
      mimeType = 'text/markdown';
    }

    // 创建Blob对象
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    // 创建下载链接并触发下载
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 清理URL对象
    URL.revokeObjectURL(url);
    message.success(`已下载${format === 'html' ? 'HTML' : 'Markdown'}文件`);
  };

  // 导出为图片
  const handleExportImage = async () => {
    if (!generatedContent) {
      message.warning('没有可导出的内容');
      return;
    }

    try {
      message.loading('正在生成图片...', 0);
      
      // 创建一个临时的容器来渲染完整内容
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 800px;
        background: white;
        padding: 40px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
        line-height: 1.6;
        color: #333;
      `;
      
      // 将 Markdown 转换为 HTML
      const htmlContent = marked.parse(generatedContent);
      tempContainer.innerHTML = htmlContent;
      
      // 添加样式
      const style = document.createElement('style');
      style.textContent = `
        h1, h2, h3, h4, h5, h6 { 
          color: #1f1f1f; 
          margin-top: 1.5em; 
          margin-bottom: 0.5em;
        }
        h1 { font-size: 2em; }
        h2 { font-size: 1.5em; }
        h3 { font-size: 1.25em; }
        p { 
          color: #666; 
          line-height: 1.8; 
          margin: 0.5em 0;
        }
        ul, ol { 
          padding-left: 2em; 
          margin: 0.5em 0;
        }
        li { 
          margin: 0.3em 0; 
          color: #666; 
        }
        blockquote {
          border-left: 4px solid #ddd;
          padding-left: 1em;
          margin: 1em 0;
          color: #666;
        }
        code {
          background: #f5f5f5;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }
        pre {
          background: #f5f5f5;
          padding: 1em;
          border-radius: 5px;
          overflow-x: auto;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background: #f5f5f5;
        }
      `;
      tempContainer.appendChild(style);
      
      // 将临时容器添加到 DOM 中
      document.body.appendChild(tempContainer);
      
      // 等待内容渲染完成
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 使用 html2canvas 捕获完整内容
      const canvas = await html2canvas(tempContainer, {
        scale: 2, // 提高图片质量
        useCORS: true, // 允许加载跨域图片
        backgroundColor: '#ffffff', // 设置白色背景
        logging: false, // 关闭日志
        width: tempContainer.scrollWidth,
        height: tempContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });
      
      // 清理临时容器
      document.body.removeChild(tempContainer);
      
      // 将canvas转换为图片并下载
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = '教案内容.png';
      link.href = image;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.destroy();
      message.success('图片导出成功');
    } catch (error) {
      console.error('导出图片失败:', error);
      message.destroy();
      message.error('导出图片失败，请重试');
    }
  };

  const fetchData=async ()=>{
    try{
      const res =await textResource({userId: parseInt(userInfo.uid),pageNum:1,pageSize:10,textType:'teachingplan'});
      console.log(res.data.data)
      setHistoryList(res.data.data)

    }catch(e){

    }

  }
  useEffect(() => {
      fetchData(); 
  }, []); 
  // 处理图片上传
  const handleImageUpload = async (file) => {
    if (!file) return;
    
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB！');
      return;
    }

    setImageUploading(true);
    try {
      // 这里使用 FileReader 读取图片文件
      const reader = new FileReader();
      reader.onload = (e) => {
        if (editor) {
          // 在光标位置插入图片
          editor.chain().focus().setImage({ src: e.target.result }).run();
          message.success('图片插入成功');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('图片上传失败:', error);
      message.error('图片上传失败，请重试');
    } finally {
      setImageUploading(false);
    }
  };

  const [selectedKnowledge, setSelectedKnowledge] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(8);
  const knowledgeOptions = [
    { label: '语文知识库', value: 'chinese' },
    { label: '数学知识库', value: 'math' },
    { label: '英语知识库', value: 'english' },
    { label: '物理知识库', value: 'physics' },
  ];
  const [courseOptions,setCourseOptions] = useState([
    { label: '语文', value: 'chinese', desc: '人文素养与阅读写作', createdAt: '2024-06-01' },
    { label: '数学', value: 'math', desc: '逻辑思维与解题能力', createdAt: '2024-05-20' },
    { label: '英语', value: 'english', desc: '听说读写全方位提升', createdAt: '2024-05-15' },
    { label: '物理', value: 'physics', desc: '实验探究与理论结合', createdAt: '2024-04-30' },
  ]);
  const handleCreate = () => {
    message.success(`已选择知识库：${selectedKnowledge || '无'}，课程：${selectedCourse || '无'}，即将创作！`);
    // 这里可以触发实际的创作逻辑
  };
  // 假设知识库数据如下
  const [knowledgeList,setKnowledgeList] = useState([]);
  const selectedKnowledgeObj = knowledgeList.find(k => k.knowledgebaseId === selectedKnowledge);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const filteredKnowledgeList = knowledgeList.filter(item =>
    item.knowledgebaseName.includes(knowledgeSearch) || item.knowledgebaseIntroduction.includes(knowledgeSearch)
  );
  const handleSelectKnowledgeModal = (item) => {
    setSelectedKnowledge(item.knowledgebaseId);
    setIsKnowledgeModalOpen(false);
    setKnowledgeSearch('');
  };
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const filteredCourseList = courseOptions.filter(item =>
    item.courseName?.includes(courseSearch)
  );
  const selectedCourseObj = courseOptions.find(c => c.courseId === selectedCourse);
  const handleSelectCourseModal = (item) => {
    setSelectedCourse(item.courseId);
    setIsCourseModalOpen(false);
    setCourseSearch('');
  };

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
  const [currentCourse,setCurrentCourse]=useState(null)
  const handleSaveSubmit = async () => {
      setIsSaving(true);
      try {
        // 这里添加实际的保存逻辑
        const res =await saveTextResource(
          {
            "text_picture": "https://weizixuan.oss-cn-beijing.aliyuncs.com/a3aedacc-0fbf-48da-b75d-6eb43c3b21b2.png",
            "textType":  saveFormData.course,
            "textName": saveFormData.name,
            "textIntroduction": saveFormData.notes,
            "textContent": generatedContent,
            "textUrl": "",
            "status": 0,
            "courseId": currentCourse
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
  const getBaseList =async ()=>{
    try{
      const res = await getKnowledgebaseList()
      console.log(res)
      const res1 =await getCourseList()
      console.log(res1)
      setCourseOptions(res1.data.data)
      setKnowledgeList(res.data.data) 
    } catch (error) {
      message.error('保存失败，请重试！');
    } 

  }
useEffect( () => {
  getBaseList();
}, []);

  return (
    <div className={styles.teacherPlan}>
       <div className={styles.title}>
          <h1>智能教案生成助手</h1>
        </div>
        <hr className={styles.divider} />
      <div className={styles.tContent}>
        <div className={styles.bottomContent}>
          {!isEditorOpen && (
            <div className={styles.left}>
              <div className={styles.uploadSection}>
                <div className={styles.sectionTitle}>
                  <UploadIcon theme="filled" size="20" />
                  <span>上传文件生成教案</span>
                </div>
                <div className={styles.uploadArea}>
                   <Upload
                     {...uploadProps}
                   >
                     <Button icon={<UploadOutlined />} className={styles.uploadButton}>
                       点击上传文件
                     </Button>
                     <p className={styles.uploadHint}>支持 PDF、Word、PPT 等格式文件</p>
                   </Upload>
                 </div>
               
                {uploadedFile && (
                  <div className={styles.uploadedFile}>
                    <div className={styles.fileInfo}>
                      {uploadedFile.type.includes('pdf') ? (
                        <FilePdf theme="filled" size="24" />
                      ) : (
                        <FileWord theme="filled" size="24" />
                      )}
                      <span>{uploadedFile.name}</span>
                      </div>
                    <Button type="text" icon={<Close />} onClick={() => setUploadedFile(null)} />
                  </div>
                )}
                <div className={styles.uploadActions}>
                  <Button
                    type="primary"
                    onClick={handleFileGenerate}
                    loading={isUploading}
                    disabled={!uploadedFile}
                    icon={<MagicWand theme="filled" />}
                  >
                    {isUploading ? '生成中...' : '从文件生成'}
                  </Button>
                  </div>
                </div>
                <div className={styles.dividerLine}>
                  <span>或</span>
                </div>
                <div className={styles.inputSection}>
                  <div className={styles.Title}>
                    <div className={styles.sectionTitle}>
                      <Edit theme="filled" size="20" />
                      <span>输入教案描述</span>
                    </div>
                  </div>
                  <div className={styles.selectPanel}>
                    {/* 知识库选择弹窗触发 */}
                    <div
                      className={styles.knowledgeSelectBox}
                      onClick={() => setIsKnowledgeModalOpen(true)}
                      tabIndex={0}
                    >
                      {selectedKnowledgeObj ? (
                        <>
                          <div className={styles.knowledgeTitle}>{selectedKnowledgeObj.knowledgebaseName}</div>
                        </>
                      ) : (
                        <span className={styles.knowledgePlaceholder}>请选择知识库</span>
                      )}
                    </div>
                    {/* 课程选择弹窗触发 */}
                    <div
                      className={styles.knowledgeSelectBox}
                      onClick={() => setIsCourseModalOpen(true)}
                      tabIndex={0}
                    >
                      {selectedCourseObj ? (
                        <>
                          <div className={styles.knowledgeTitle}>{selectedCourseObj.courseName}</div>
                        </>
                      ) : (
                        <span className={styles.knowledgePlaceholder}>请选择课程</span>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.inputWrapper}>
                    <TextArea
                      value={prompt}
                      className={styles.promptInput}
                      placeholder="请描述您想要生成的教案内容，包括：
                        1. 课程主题和教学目标
                        2. 学生年级和学科
                        3. 教学重难点
                        4. 特殊教学需求（如有）"
                      onChange={(e) => setPrompt(e.target.value)}
                      autoSize={{ minRows: 6, maxRows: 12 }}
                    />
                  </div>
    
                  <div className={styles.generateWrapper}>
                    <button 
                      className={styles.generateButton}
                      onClick={handleGenerate}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <MagicWand theme="filled" size="20" spin />
                          <span>生成中...</span>
                        </>
                      ) : (
                        <>
                          <MagicWand theme="filled" size="20" />
                          <span>生成教案</span>
                        </>
                      )}
                    </button>
                  </div>
              </div>
            </div>
          )}
          
          <div className={styles.right}>
            {!isEditorOpen ? (
              <div className={styles.previewSection}>
                <div className={styles.previewHeader}>
                  <div className={styles.headerTitle}>
                    <FileText theme="filled" size="24" />
                    <span>教案预览</span>
                  </div>
                  <div className={styles.headerActions}>
                    <Button type="text" icon={<Edit theme="outline" />} onClick={handleEditPlan}>
                      编辑教案
                    </Button>
                    <Button type="text" icon={<FileText theme="outline" />} onClick={() => setIsSaveModalOpen(true)}>
                      保存教案
                    </Button>
                    <Button type="text" icon={<FileText theme="outline" />} onClick={() => handleDownload('markdown')}>
                      导出Markdown
                    </Button>
                    <Button type="text" icon={<Picture theme="outline" />} onClick={handleExportImage}>
                      导出图片
                    </Button>
                  </div>
                </div>
                <div className={styles.previewContent}>
                  <ReactMarkdown>{generatedContent}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className={styles.editorSection}>
                <div className={styles.editorHeader}>
                  <div className={styles.headerTitle}>
                    <Edit theme="filled" size="24" />
                    <span>编辑教案</span>
                  </div>
                  <div className={styles.headerActions}>
                    {renderEditorToolbar()}
                  </div>
                </div>
                <div className={styles.editorContent}>
                  <div className={styles.sectionsList}>
                    {sections.map((section, index) => (
                      <div
                        key={index}
                        className={`${styles.sectionItem} ${selectedSection === index ? styles.selected : ''}`}
                        onClick={() => handleSectionSelect(index)}
                        data-section={index}
                      >
                        {index==1?(<span className={styles.sectionNumber}>{sections[index].split('\n')[1].split('#')}</span>)
                        :(<span className={styles.sectionNumber}>{sections[index].split('\n')[2].split('#')}</span>)}
                      </div>
                    ))}
                  </div>
                  <div className={styles.editorArea}>
                    <div className={styles.editorMain}>
                      <EditorContent editor={editor} />
                    </div>
                  </div>
                </div>
                <div className={styles.editorFooter}>
                  <Button onClick={handleCloseEditor}>取消编辑</Button>
                  <Button type="primary" onClick={handleSectionSave}>优化段落</Button>
                  <Button type="primary" onClick={handleOutlineSave}>结束编辑</Button>
                </div>
                {/* 优化弹窗 */}
             
              </div>
            )}
          </div>
        </div>
      </div>
      {isSaveModalOpen && (
        <div className={styles.saveModalOverlay} onClick={() => setIsSaveModalOpen(false)}>
          <div className={styles.saveModalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>保存教案</h3>
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
                <div className={styles.text}>放入教案库</div>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>教案名称</label>
              <input
                type="text"
                name="name"
                value={saveFormData.name}
                onChange={handleInputChange}
                placeholder="请输入教案名称"
              />
            </div>

            <div className={styles.formGroup}>
              <label>教案备注</label>
              <textarea
                name="notes"
                value={saveFormData.notes}
                onChange={handleInputChange}
                placeholder="请输入教案备注信息"
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
      {isKnowledgeModalOpen && (
        <div className={styles.knowledgeModalOverlay} onClick={() => setIsKnowledgeModalOpen(false)}>
          <div className={styles.knowledgeModal} onClick={e => e.stopPropagation()}>
            <div className={styles.knowledgeModalHeader}>
              <span>选择知识库</span>
              <button className={styles.knowledgeModalClose} onClick={() => setIsKnowledgeModalOpen(false)}>×</button>
            </div>
            <div className={styles.knowledgeModalSearch}>
              <input
                type="text"
                placeholder="搜索知识库..."
                value={knowledgeSearch}
                onChange={e => setKnowledgeSearch(e.target.value)}
              />
            </div>
            <div className={styles.knowledgeModalList}>
              {filteredKnowledgeList.length === 0 && <div className={styles.knowledgeModalEmpty}>无匹配知识库</div>}
              {filteredKnowledgeList.map(item => (
                <div
                  key={item.knowledgebaseId}
                  className={styles.knowledgeModalItem + (selectedKnowledge === item.knowledgebaseId ? ' ' + styles.knowledgeModalItemActive : '')}
                  onClick={() => handleSelectKnowledgeModal(item)}
                >
                  <div className={styles.knowledgeTitle}>{item.knowledgebaseName}</div>
                  <div className={styles.knowledgeDesc}>{item.knowledgebaseIntroduction}</div>
                  <div className={styles.knowledgeFiles}>创建时间：{item.createTime}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* 课程选择弹窗 */}
      {isCourseModalOpen && (
        <div className={styles.knowledgeModalOverlay} onClick={() => setIsCourseModalOpen(false)}>
          <div className={styles.knowledgeModal} onClick={e => e.stopPropagation()}>
            <div className={styles.knowledgeModalHeader}>
              <span>选择课程</span>
              <button className={styles.knowledgeModalClose} onClick={() => setIsCourseModalOpen(false)}>×</button>
            </div>
            <div className={styles.knowledgeModalSearch}>
              <input
                type="text"
                placeholder="搜索课程..."
                value={courseSearch}
                onChange={e => setCourseSearch(e.target.value)}
              />
            </div>
            <div className={styles.knowledgeModalList}>
              {filteredCourseList.length === 0 && <div className={styles.knowledgeModalEmpty}>无匹配课程</div>}
              {filteredCourseList.map(item => (
                <div
                  key={item.courseId}
                  className={styles.knowledgeModalItem + (selectedCourse === item.courseId ? ' ' + styles.knowledgeModalItemActive : '')}
                  onClick={() => handleSelectCourseModal(item)}
                >
                  <div className={styles.knowledgeTitle}>{item.courseName}</div>
                  <div className={styles.knowledgeDesc}>{item.desc}</div>
                  <div className={styles.knowledgeFiles}>创建时间：{item.startTime?.split('T')[0]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
     
     {/* 课程选择弹窗 */}
      {isOptimizeModalOpen && (
        <div className={styles.optimizeCompareBoxOverlay} onClick={() => setIsOptimizeModalOpen(false)}>
          <div className={styles.optimizeCompareBoxModal} onClick={e => e.stopPropagation()}>
            <div className={styles.optimizeCompareBox}>
              <div className={styles.optimizeColumn}>
                <h4 className={styles.optimizeTitle + ' ' + styles.originTitle}>原内容</h4>
                <div className={styles.optimizeContent + ' ' + styles.originContent}>
                  {optimizingIndex != null ? sections[optimizingIndex] : ''}
                </div>
              </div>
              <div className={styles.optimizeColumn}>
                <h4 className={styles.optimizeTitle + ' ' + styles.optimizedTitle}>优化后</h4>
                <textarea
                  className={styles.optimizeContent + ' ' + styles.optimizedContent}
                  value={optimizedContent}
                  onChange={e => setOptimizedContent(e.target.value)}
                  rows={8}
                  style={{resize: 'vertical'}}
                />
              </div>
            </div>
            <div className={styles.optimizeBtnGroup}>
              <button className={styles.diamondBtn + ' ' + styles.cancelBtn} onClick={handleCancelOptimize}>取消</button>
              <button className={styles.diamondBtn + ' ' + styles.confirmBtn} onClick={handleConfirmOptimize}>确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPlan;

