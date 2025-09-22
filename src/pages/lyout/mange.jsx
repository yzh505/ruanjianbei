import React, { useState ,useEffect} from 'react';
import { useParams } from 'react-router-dom';
import styles from '../../scss/mange.module.scss';
import { Layout } from 'antd';
import Head from '../components/head';
import Side from '../components/side';
import Courseware from '../generate/Courseware';
import MediaResources from '../generate/mediaResources';
import Modules from '../lyout/Modules';
import Exercise from '../generate/exercise';
import Retrieval from '../agentManage/retrieval';
import MyResources from '../agentManage/myResources';
import Visualization from '../agentManage/Visualization';
import CourseDesigin from '../courseDesign/courseDesign';
import MindMap from '../components/mindMap';
import Recommendations from '../personalize/recommendations'
import Analytics from '../personalize/analytics'
import ManageBase from '../knowledgeBase/manageBase'
import UseBase from '../knowledgeBase/useBase'
import AIHelper from '../components/AIHelper';
import AddCalendar from '../courseDesign/addCalendar';
// 修复导入路径 - 使用正确的相对路径
import AvatarPlatform,{PlayerEvents,SDKEvents,} from '../../lib/avatar-sdk-web_3.1.2.1002/index.js'

// 在页面组件中使用
<AIHelper />
const { Content } = Layout;

const Manage = () => {

  const params = useParams();
  // 支持 /manage/:module 路由参数
  const initialModule = params.module || 'courseware'
  const resource = params.resource || 'select';
  const [selectedModule, setSelectedModule] = useState(initialModule);
  const [collapsed, setCollapsed] = useState(false);

  const getContent = (module) => {
    switch (module) {
      case 'courseware':
        return <Courseware />;
      case 'media':
        return <MediaResources />;
      case 'exercise':
        return <Exercise />;
      case 'courseDesign':
        return <CourseDesigin />;
      case 'add-calendar':
        return <AddCalendar />;
      case 'search':
        return <Retrieval  />;
      case 'visual-analytics':
        return <Visualization />;
      case 'category':
        return <MyResources  resource={resource}   />;
      case 'mindMap':
        return <MindMap />;
      case 'ManageBase':
        return <ManageBase/>;
      case 'useBase':
        return <UseBase/>;
      case 'course-recommend':
        return <Recommendations/>;
      case 'analysis':
        return <Analytics />;
    }
  };
//数字人

useEffect(() => {
 // startAvataarPlarform();
}, []);

  return (
    <div className={styles.manage}>
      <div className={`${styles.sider} ${collapsed ? styles.collapsed : ''}`}>
        <Side 
          selectedModule={selectedModule} 
          setSelectedModule={setSelectedModule}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
        <AIHelper />
      </div>
      <div className={`${styles.contentWrapper} ${collapsed ? styles.contentWrapperCollapsed : ''}`}>
        <div className={styles.content}>
          <Head collapsed={collapsed} />
        <div className={styles.mainContent}>
          {getContent(selectedModule)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manage;
