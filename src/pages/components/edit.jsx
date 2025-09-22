import React, { useState, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import { Card, Select, Input, Button, message, Space, List, Empty, Upload, Dropdown } from 'antd';
import Modal from 'react-modal';
import { Plus, Send, Edit, FileText, MagicWand, FolderPlus, Eye, BookOpen, EditPen, Close, History, Delete, Upload as UploadIcon, FileWord, FilePdf, Search, AddPicture, Table as TableIcon, Picture } from '@icon-park/react';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { Extension } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import TableHeader from '@tiptap/extension-table-header';
import ReactMarkdown from 'react-markdown';
import styles from '../../scss/components/edit.module.scss';
import {textResource,saveTextResource} from '../../api/courseware'; // 导入教案列表查询API
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

const EditTeacher = ({content}) => {
      const [generatedContent, setGeneratedContent] = useState(content);
      const [isEditorOpen, setIsEditorOpen] = useState(false);
      const [sections, setSections] = useState([]);
      const [selectedSection, setSelectedSection] = useState(null);
      const token = localStorage.getItem('accessToken');
      const userInfo =JSON.parse(localStorage.getItem('user')) ;
      const [historyList, setHistoryList] = useState([]);
      const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
      const [imageUploading, setImageUploading] = useState(false);
      const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
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
      const handleSectionSave = () => {
        if (editor && selectedSection !== null) {
          const editorContent = editor.getHTML();
          const newSections = editorContent.split('## ').filter(section => section.trim());
          setSections(newSections);
          message.success('段落保存成功');
        }
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
 
    
  return (
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
                    <span className={styles.sectionNumber}>段落 {index + 1}</span>
                    <span className={styles.sectionPreview}>
                      {section.split('\n')[0].substring(0, 20)}...
                    </span>
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
              <Button type="primary" onClick={handleSectionSave}>保存段落</Button>
              <Button type="primary" onClick={handleOutlineSave}>结束编辑</Button>
            </div>
          </div>
        )}
    </div>
  );
};

export default EditTeacher;
