import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Download, 
  Star,
  ArrowLeft
} from '@icon-park/react';
import { Button, Input, Select, Checkbox, Slider, Tag, message, Modal, Progress } from 'antd';
import { setPPTTipic ,generatePPT} from '../../../api/courseware';
import styles from '../../../scss/generate/PPT/PPTModule.module.scss';

const { Option } = Select;

const PPTModule = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { content } = location.state || {};
  const [activeScene, setActiveScene] = useState('');
  const [activeStyle, setActiveStyle] = useState('');
  const [activeColor, setActiveColor] = useState('');
  // 模板数据
  const [templates, setTemplates] = useState([
    {
      color: "蓝色",
      coverImageList: [
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_190523…lND0=&x_location=7YfmxI7B7uKO7jlRxIftd60pe5D=&bg=', 
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_190523…lND0=&x_location=7YfmxI7B7uKO7jlRxIftd60pe5D=&bg=', 
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/1905232…kUT0=&x_location=7YfmxI7B7uKO7jlRxIftd67ado==&bg=', 
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/1905232…NRT0=&x_location=7YfmxI7B7uKO7jlRxIftd67ado==&bg=', 
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/1905232…1RT0=&x_location=7YfmxI7B7uKO7jlRxIftd67ado==&bg=', 
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/1905232…zMD0=&x_location=7YfmxI7B7uKO7jlRxIftd67ado==&bg='],
      industry: "教育培训",
      style: "卡通",
      templateIndexId: "202407179097C2D",
      titleCoverImage: "https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_190523…lND0=&x_location=7YfmxI7B7uKO7jlRxIftd60pe5D=&bg=",
      rating: 4.8,
      downloads: 1250,
      tags: ['商务', '简约', '专业']
    },
    {
      color: "蓝色",
      coverImageList: [
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_19052329831_q1PjK61731549744816-015276761286617369.jpeg?authorization=c2ltcGxlLWp3dCBhaz1zcGFya2Rlc2s4MDAwMDAwMDAwMDE7ZXhwPTMzMDgzNDk3NDY7YWxnbz1obWFjLXNoYTI1NjtzaWc9dGk2YmwvSzJkWTQvbzBSMmM4dy9kbG1nMmRRRGMxbmlJQ1hzUXJVTVVkST0=&x_location=7YfmxI7B7uKO7jlRxIftd60pe5D=&bg=',
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_19052329831_q1PjK61731549744816-015276761286617369.jpeg?authorization=c2ltcGxlLWp3dCBhaz1zcGFya2Rlc2s4MDAwMDAwMDAwMDE7ZXhwPTMzMDgzNDk3NDY7YWxnbz1obWFjLXNoYTI1NjtzaWc9dGk2YmwvSzJkWTQvbzBSMmM4dy9kbG1nMmRRRGMxbmlJQ1hzUXJVTVVkST0=&x_location=7YfmxI7B7uKO7jlRxIftd60pe5D=&bg=',
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_19052329831_q1PjK61731549744816-015276761286617369.jpeg?authorization=c2ltcGxlLWp3dCBhaz1zcGFya2Rlc2s4MDAwMDAwMDAwMDE7ZXhwPTMzMDgzNDk3NDY7YWxnbz1obWFjLXNoYTI1NjtzaWc9dGk2YmwvSzJkWTQvbzBSMmM4dy9kbG1nMmRRRGMxbmlJQ1hzUXJVTVVkST0=&x_location=7YfmxI7B7uKO7jlRxIftd60pe5D=&bg=',
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_19052329831_q1PjK61731549744816-015276761286617369.jpeg?authorization=c2ltcGxlLWp3dCBhaz1zcGFya2Rlc2s4MDAwMDAwMDAwMDE7ZXhwPTMzMDgzNDk3NDY7YWxnbz1obWFjLXNoYTI1NjtzaWc9dGk2YmwvSzJkWTQvbzBSMmM4dy9kbG1nMmRRRGMxbmlJQ1hzUXJVTVVkST0=&x_location=7YfmxI7B7uKO7jlRxIftd60pe5D=&bg=', 
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_19052329831_q1PjK61731549744816-015276761286617369.jpeg?authorization=c2ltcGxlLWp3dCBhaz1zcGFya2Rlc2s4MDAwMDAwMDAwMDE7ZXhwPTMzMDgzNDk3NDY7YWxnbz1obWFjLXNoYTI1NjtzaWc9dGk2YmwvSzJkWTQvbzBSMmM4dy9kbG1nMmRRRGMxbmlJQ1hzUXJVTVVkST0=&x_location=7YfmxI7B7uKO7jlRxIftd60pe5D=&bg='
      ],
      industry: "学院",
      style: "简约",
      templateIndexId: "202407176CA9161",
      titleCoverImage: "https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_19052329831_q1PjK61731549744816-015276761286617369.jpeg?authorization=c2ltcGxlLWp3dCBhaz1zcGFya2Rlc2s4MDAwMDAwMDAwMDE7ZXhwPTMzMDgzNDk3NDY7YWxnbz1obWFjLXNoYTI1NjtzaWc9dGk2YmwvSzJkWTQvbzBSMmM4dy9kbG1nMmRRRGMxbmlJQ1hzUXJVTVVkST0=&x_location=7YfmxI7B7uKO7jlRxIftd60pe5D=&bg=",
      rating: 4.8,
      downloads: 1250,
      tags: ['商务', '简约', '专业']
    },
    {
      color: "红色",
      coverImageList: [
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_174273…kUT0=&x_location=7YfmxI7B7uKO7jlRxIftd60weXD=&bg=', 
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_174273…kUT0=&x_location=7YfmxI7B7uKO7jlRxIftd60weXD=&bg=', 
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_174273…3VT0=&x_location=7YfmxI7B7uKO7jlRxIftd60weXD=&bg=', 
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_174273…jMD0=&x_location=7YfmxI7B7uKO7jlRxIftd60weXD=&bg=', 
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_174273…lTT0=&x_location=7YfmxI7B7uKO7jlRxIftd60weXD=&bg=', 
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_174273…wcz0=&x_location=7YfmxI7B7uKO7jlRxIftd60weXD=&bg='],
      industry: "政务",
      style: "商务",
      templateIndexId: "2024071754A6ADE",
      titleCoverImage: "https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_1742734573449-03506464373301561.jpeg?authorization=c2ltcGxlLWp3dCBhaz1zcGFya2Rlc2s4MDAwMDAwMDAwMDE7ZXhwPTMzMTk1MzQ1Nzg7YWxnbz1obWFjLXNoYTI1NjtzaWc9UXd3NlhwcWdRMG9QQmV4dnZVbXVVazRBQi9mRmdmc3pIVm9lWWdDaXhkUT0=&x_location=7YfmxI7B7uKO7jlRxIftd60weXD=&bg=",
      rating: 4.8,
      downloads: 1250,
      tags: ['商务', '简约', '专业']
    },
    {
      color: "黄色",
      coverImageList: [
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_190523…rND0=&x_location=7YfmxI7B7uKO7jlRxIftd60pe5D=&bg=', 
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_190523…rND0=&x_location=7YfmxI7B7uKO7jlRxIftd60pe5D=&bg=', 
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/1905232…rcz0=&x_location=7YfmxI7B7uKO7jlRxIftd67ado==&bg=', 
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/1905232…zRT0=&x_location=7YfmxI7B7uKO7jlRxIftd67ado==&bg=', 
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/1905232…0VT0=&x_location=7YfmxI7B7uKO7jlRxIftd67ado==&bg=', 
        'https://sgw-dx.xf-yun.com/api/v1/sparkdesk/1905232…END0=&x_location=7YfmxI7B7uKO7jlRxIftd67ado==&bg='],
      industry: "科技互联网",
      style: "创意",
      templateIndexId: "20240718489569D",
      titleCoverImage: "https://sgw-dx.xf-yun.com/api/v1/sparkdesk/_1742734573449-03506464373301561.jpeg?authorization=c2ltcGxlLWp3dCBhaz1zcGFya2Rlc2s4MDAwMDAwMDAwMDE7ZXhwPTMzMTk1MzQ1Nzg7YWxnbz1obWFjLXNoYTI1NjtzaWc9UXd3NlhwcWdRMG9QQmV4dnZVbXVVazRBQi9mRmdmc3pIVm9lWWdDaXhkUT0=&x_location=7YfmxI7B7uKO7jlRxIftd60weXD=&bg=",
      rating: 4.8,
      downloads: 1250,
      tags: ['商务', '简约', '专业']
    },
    {
      id: 5,
      name: '教育培训',
      category: 'education',
      style: 'friendly',
      color: 'cyan',
      titleCoverImage: 'https://wkbjcloudbos.bdimg.com/v1/docconvert9179/07ad630d4928053e0313431b91d085a5/rtcs/ppteditor/1727087856845/image/e61a30da1b22d22e77edaec84f796e5e.png?responseContentType=image%2Fpng&responseCacheControl=max-age%3D3600&responseExpires=Mon%2C%2023%20Sep%202024%2019%3A37%3A37%20%2B0800&authorization=bce-auth-v1%2F46dc8cc346744dad800651823a96d9cd%2F2024-09-23T10%3A37%3A37Z%2F311040000%2Fhost%2Fadc4c806d6f64294aa150f8e8ef4cdb3ae655967e7edeb37db84ffbaac2bad35&token=eyJ0eXAiOiJKSVQiLCJ2ZXIiOiIxLjAiLCJhbGciOiJIUzI1NiIsImV4cCI6MjAzODEyNzg1NywidXJpIjp0cnVlLCJwYXJhbXMiOlsicmVzcG9uc2VDb250ZW50VHlwZSIsInJlc3BvbnNlQ2FjaGVDb250cm9sIiwicmVzcG9uc2VFeHBpcmVzIl19.IB3wT%2Fe5ME7egNMZiIxzelEJ%2F9boXravc9U96Y0AcnQ%3D.2038127857',
      rating: 4.7,
      downloads: 980,
      tags: ['教育', '友好', '清晰']
    },
    {
      id: 6,
      name: '科技未来',
      category: 'technology',
      style: 'futuristic',
      color: 'dark',
      titleCoverImage: 'https://via.placeholder.com/300x200/262626/ffffff?text=科技未来',
      rating: 4.4,
      downloads: 720,
      tags: ['科技', '未来', '创新']
    },
    {
      id: 7,
      name: '医疗健康',
      category: 'medical',
      style: 'clean',
      color: 'teal',
      titleCoverImage: 'https://via.placeholder.com/300x200/006d75/ffffff?text=医疗健康',
      rating: 4.8,
      downloads: 1100,
      tags: ['医疗', '清洁', '专业']
    },
    {
      id: 8,
      name: '金融投资',
      category: 'finance',
      style: 'elegant',
      color: 'gold',
      titleCoverImage: 'https://via.placeholder.com/300x200/d48806/ffffff?text=金融投资',
      rating: 4.6,
      downloads: 1350,
      tags: ['金融', '优雅', '可信']
    }
  ]);

  // 筛选状态
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [ratingFilter, setRatingFilter] = useState([0, 5]);
  const [selectedTags, setSelectedTags] = useState([]);

  // 分类选项
  const categories = [
    { value: 'all', label: '全部' },
    { value: 'business', label: '商务' },
    { value: 'creative', label: '创意' },
    { value: 'academic', label: '学术' },
    { value: 'marketing', label: '营销' },
    { value: 'education', label: '教育' },
    { value: 'technology', label: '科技' },
    { value: 'medical', label: '医疗' },
    { value: 'finance', label: '金融' }
  ];
 const scenes = ['','科技互联网','教育培训','政务','学院','金融战略','法律','医疗健康','文旅体育','艺术广告','人力资源','游戏娱乐'];
  const style = ['','简约','卡通','商务','创意','国风','清新','扁平','插画','节日'];
  const colors = [{name:'',color:''},
    {name:'黄色',color:'#FBF769'},
    {name:'绿色',color:'#C2F79C'},
    {name:'粉色',color:'#FF9999'},
    {name:'蓝色',color:'#6BE5EF'},
    {name:'紫色',color:'#7966FF'},
    {name:'橙色',color:'#FF7F27'},
    {name:'灰色',color:'#ccc'},
    {name:'红色',color:'#C00000'}
  ];

  const [filteredTemplates, setFilteredTemplates] = useState(templates);

  const [PPTId,setPPID] =useState('d862ae0d9ce741d2854fe45ce2259dbf');
  // 新增：当前选中的模板
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  // 新增：模拟每个模板有4张预览图
  const getPreviewImages = (tpl) => {
  if (!tpl || !Array.isArray(tpl.coverImageList)) return [];
  // 只取前4张，若不足4张用空字符串补齐
  const arr = tpl.coverImageList.slice(0, 4);
  while (arr.length < 4) arr.push('');
  return arr;
};
  
  const back =()=>{
    navigate('/Mange')
   }
  const GeneratePPT = async () => {
    if (!selectedTemplate) {
      message.error('请先选择一个模板');
      return;
    }
    if (!content) {
      message.error('缺少PPT大纲内容');
      return;
    }
    console.log(content+'111')
    setIsModalVisible(true);
    try {
      /* const outlineContent = typeof content === 'string' ? content : JSON.stringify(content);
      const formData1 = new FormData();
      formData1.append('topicid', selectedTemplate.templateIndexId);
      formData1.append('outline', outlineContent);
      const res = await generatePPT(formData1);
      if (res && res.data) {
        message.success('PPT生成成功');console.log(res.data)
        setPPID(res.data.data)
      } else {
        message.error('PPT生成失败');
      }  */
    } catch (e) {
      message.error('PPT生成失败');
    }
  };
  const fetchTemplates = async () => {
    try {
      const res = await setPPTTipic({
        pageNum: 1,
        pageSize: 20,
        color:activeColor,
        industry:activeScene,
        style:activeStyle,
      });
      if (res) {
        console.log(res.data)
        setTemplates(res.data);
        setFilteredTemplates(res.data)
        console.log(templates)
      } else {
      }
    } catch (e) {
      setTemplates([]);
      message.error('获取PPT模板失败');
    }
  };

useEffect(() => {
  if (activeColor !== null || activeStyle !== null|| activeScene !== null) {
    fetchTemplates();
  }
}, [activeColor, activeStyle,activeScene]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationComplete, setGenerationComplete] = useState(false);

  // 处理进度条更新
  useEffect(() => {
    let progressInterval;
    if (isGenerating && progress < 100) {
      progressInterval = setInterval(() => {
        setProgress(prevProgress => {
          if (prevProgress >= 100) {
            clearInterval(progressInterval);
            setGenerationComplete(true);
            return 100;
          }
          return prevProgress + 3;
        });
      }, 1000);
    }
    return () => clearInterval(progressInterval);
  }, [isGenerating]);

  // 处理生成PPT
  const handleGeneratePPT = () => {
    setIsModalVisible(true);
  };

  // 处理等待生成
  const handleWaitHere = () => {
    setIsGenerating(true);
  };

  // 处理稍后查看
  const handleCheckLater = () => {
    setIsModalVisible(false);
    message.success('PPT正在生成中，请稍后在资源管理中查看');
    navigate('/resources/ppt');
  };

  // 处理生成完成
  const handleComplete = () => {
    setIsModalVisible(false);
    setIsGenerating(false);
    setProgress(0);
    setGenerationComplete(false);
    navigate(`/PPTplayer`, { state: { PPTId } });
  };

  // 处理关闭弹窗
  const handleCloseModal = () => {
    if (isGenerating && !generationComplete) {
      Modal.confirm({
        title: '确认取消',
        content: '正在生成PPT，确定要取消吗？',
        onOk: () => {
          setIsModalVisible(false);
          setIsGenerating(false);
          setProgress(0);
          setGenerationComplete(false);
        }
      });
    } else {
      setIsModalVisible(false);
      setIsGenerating(false);
      setProgress(0);
      setGenerationComplete(false);
    }
  };

 return (
    <div className={styles.pptModule}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>
            <button onClick={()=>back()}><ArrowLeft theme="outline" size="18"/></button>
            <h>选择PPT模板</h>
          </div>
          <button onClick={()=>{GeneratePPT()}}>生成PPT</button>
        </div>

        <div className={styles.mainContent}>
          {/* 左侧模板预览区域 */}
          <div className={styles.templatePreview}>
            <div className={styles.previewHeader}>
              <h>模板预览</h>
              <div style={{fontWeight:600,fontSize:18}}>{(selectedTemplate||filteredTemplates[0])?.name}</div>
              <span className={styles.templateCount}>共 {filteredTemplates.length} 个模板</span>
            </div> 
            {/* 新增：预览图片网格 */}
            <div className={styles.templateGrid}>
              {getPreviewImages(selectedTemplate || filteredTemplates[0]).map((img, idx) => (
                <div className={styles.templateCard} key={idx}>
                  <div className={styles.templateImage}>
                    <img src={img} alt={selectedTemplate ? selectedTemplate.name : filteredTemplates[0]?.name} />
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.bottom} style={{marginTop:'30px'}}>智慧出版社</div>
            <div className={styles.bottom1}>智慧模板库提供，所有模板不可转载</div>
           
          </div>

          {/* 右侧筛选条件 */}
          <div className={styles.filterPanel}>
            <div className={styles.filterHeader}><h>筛选模板</h></div>
            <div className={styles.filterConditionBox}>
              <div style={{display:'flex',gap:'30px'}}>
                <div className={styles.filterRow}>
                  <span>场景：</span>
                  <select className={styles.sceneSelect} value={activeScene} onChange={e => setActiveScene(e.target.value)}>
                    <option value=''>全部</option>
                    {scenes.slice(1).map((scene, idx) => (
                      <option key={idx} value={scene}>{scene}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.filterRow}>
                  <span>风格：</span>
                  <select className={styles.sceneSelect} value={activeStyle} onChange={e => setActiveStyle(e.target.value)}>
                    <option value=''>全部</option>
                    {style.slice(1).map((sty, idx) => (
                      <option key={idx} value={sty}>{sty}</option>
                    ))}
                  </select>
                </div>
              </div>
             
              <div className={styles.filterRow}>
                <span>颜色：</span>
                <div className={styles.colorList}>
                  {colors.map((color, idx) => (
                    <div
                      key={idx}
                      className={activeColor === color.name ? styles.activeColor : styles.colorItem}
                      style={{ backgroundColor: color.color, border: activeColor === color.name ? '2px solid #62ca76' : '1px solid #eee' }}
                      onClick={() => setActiveColor(color.name)}
                    >
                      {color.name === '' && <span style={{ color: '#aaa', fontSize: 12 }}>全部</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.filterDivider}></div>
            <div className={styles.resultGrid}>
              {filteredTemplates.length === 0 && <div className={styles.empty}>暂无符合条件的模板</div>}
              {filteredTemplates.map((tpl, idx) => (
                <div className={styles.resultItem} key={tpl.id} onClick={()=>setSelectedTemplate(tpl)} style={selectedTemplate?.id===tpl.id?{border:'2px solid #1890ff',boxShadow:'0 0 0 2px #e6f7ff'}:{}}>
                  <div className={styles.resultImgBox}>
                    <img src={tpl.titleCoverImage} alt={tpl.name} />
                    <div className={styles.resultImgOverlay}>
                      <div className={styles.resultTitle}>{tpl.name}</div>
                      <div className={styles.resultTags}>
                        <span className={styles.resultTag}>{tpl.color}</span>
                        <span className={styles.resultTag}>{tpl.industry}</span>
                        <span className={styles.resultTag}>{tpl.style}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.bottom}>智慧出版社</div>
          </div>
        </div>
      </div>
      

      {/* 生成确认弹窗 */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            <div className={styles.titleText}>
              {!isGenerating ? "选择生成方式" : (generationComplete ? "生成完成" : "正在生成")}
            </div>
            <div className={styles.titleDesc}>
              {!isGenerating ? "请选择您想要的PPT生成方式" : (generationComplete ? "您的PPT已经生成完成，请选择后续操作" : "正在为您生成PPT，请稍候...")}
            </div>
          </div>
        }
        visible={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        className={styles.generateModal}
        width={520}
        maskClosable={false}
      >
        <div className={styles.modalContent}>
          {!isGenerating ? (
            <div className={styles.optionsContainer}>
              <div className={styles.option} onClick={handleWaitHere}>
                <div className={styles.optionIcon}>⏱️</div>
                <div className={styles.optionInfo}>
                  <div className={styles.optionTitle}>在此等待</div>
                  <div className={styles.optionDesc}>等待生成完成后直接查看</div>
                </div>
              </div>
              <div className={styles.option} onClick={handleCheckLater}>
                <div className={styles.optionIcon}>📋</div>
                <div className={styles.optionInfo}>
                  <div className={styles.optionTitle}>稍后查看</div>
                  <div className={styles.optionDesc}>转到资源管理页面后查看</div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.generatingContainer}>
              <div className={styles.progressInfo}>
                <div className={styles.progressStatus}>
                  {generationComplete ? "PPT生成成功！" : "正在生成中..."}
                </div>
                <div className={styles.progressPercent}>{progress<=100?progress:100}%</div>
              </div>
              <Progress 
                percent={progress} 
                status={generationComplete ? "success" : "active"}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                strokeWidth={8}
              />
              {generationComplete && (
                <div className={styles.completeActions}>
                  <Button type="primary" onClick={handleComplete} icon={<Star theme="outline" size="18"/>}>
                    查看PPT
                  </Button>
                  <Button onClick={() => navigate('/')} icon={<ArrowLeft theme="outline" size="18"/>}>
                    返回首页
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PPTModule;
