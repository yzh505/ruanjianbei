import React, { useState } from 'react';
import styles from '../../scss/components/side.module.scss';
import logo from '../../image/logo.png';
import { 
  People,
  ChartHistogramTwo,
  DataSheet,
  DocDetail,
  ConnectionBox,
  Connect,
  AreaMap,
  ActivitySource,
  SeoFolder,
  VideoConference,
  Folder,
  DataScreen,
  Timeline,
  MenuFold,
  MenuUnfold
} from '@icon-park/react';

const Side = ({ selectedModule, setSelectedModule, collapsed, setCollapsed }) => {
  const [expandedKeys, setExpandedKeys] = useState(['resource-generation']);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    {
      key: 'resource-generation',
      icon: <ActivitySource/>,
      label: '多模态资源生成',
      children: [
        {
          key: 'courseware',
          icon: <SeoFolder />,
          label: '课件制作'
        },
        {
          key: 'media',
          icon: <VideoConference />,
          label: '媒体资源'
        },
        {
          key: 'exercise',
          icon: <Folder/>,
          label: '习题生成'
        },
      ]
    },
     {
      key: 'teacher-design',
      icon: <ActivitySource/>,
      label: '课程教学设计',
      children: [
        {
          key: 'courseDesign',
          icon: <Folder/>,
          label: '课程设计'
        },
        {
          key: 'add-calendar',
          icon: <Folder/>,
          label: '我的课程'
        }
      ]
    },
    {
      key: 'resource-management',
      icon: <ActivitySource/>,
      label: '资源智能管理',
      children: [
        {
          key: 'search',
          icon: <ConnectionBox />,
          label: '资源检索'
        },
        {
          key: 'category',
          icon: <Connect/>,
          label: '我的资源管理'
        },
      ]
    },
    {
      key: 'knowledgeBase',
      icon: <DataSheet/>,
      label: '我的知识库',
      children: [
        {
          key: 'ManageBase',
          icon: <ChartHistogramTwo/>,
          label: '管理知识库'
        },
        {
          key: 'useBase',
          icon: <DocDetail />,
          label: '使用知识库'
        }
      ]
    },
    {
      key: 'recommendation',
      icon: <People />,
      label: '个性化推荐',
      children: [
        {
          key: 'course-recommend',
          icon: <DataScreen/>,
          label: '教学资源推荐'
        },
        {
          key: 'analysis',
          icon: <Timeline/>,
          label: '个性化分析'
        }
      ]
    }
  ];

  const toggleExpand = (key) => {
    if (expandedKeys.includes(key)) {
      setExpandedKeys(expandedKeys.filter(k => k !== key));
    } else {
      setExpandedKeys([...expandedKeys, key]);
    }
  };

  const renderMenuItem = (item) => {
    const isSelected = selectedModule === item.key;
    const isExpanded = expandedKeys.includes(item.key);

    return (
      <div key={item.key} className={styles.menuItem}>
        {item.children ? (
          <>
            <div 
              className={`${styles.menuTitle} ${isExpanded ? styles.expanded : ''}`}
              onClick={() => toggleExpand(item.key)}
            >
              <span className={styles.iconWrapper}>{item.icon}</span>
              {!collapsed && (
                <>
                  <span className={styles.label}>{item.label}</span>
                  <span className={`${styles.arrow} ${isExpanded ? styles.expanded : ''}`}>
                    ▼
                  </span>
                </>
              )}
            </div>
            {isExpanded && !collapsed && (
              <div className={styles.submenu}>
                {item.children.map(child => (
                  <div
                    key={child.key}
                    className={`${styles.submenuItem} ${selectedModule === child.key ? styles.selected : ''}`}
                    onClick={() => setSelectedModule(child.key)}
                  >
                    <span className={styles.iconWrapper}>{child.icon}</span>
                    <span className={styles.label}>{child.label}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div
            className={`${styles.menuTitle} ${isSelected ? styles.selected : ''}`}
            onClick={() => setSelectedModule(item.key)}
          >
            <span className={styles.iconWrapper}>{item.icon}</span>
            {!collapsed && <span className={styles.label}>{item.label}</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${styles.sideContainer} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.collapseButton} onClick={toggleCollapsed}>
        {collapsed ? <MenuUnfold /> : <MenuFold />}
      </div>
      <div className={styles.menuList}>
        {menuItems.map(renderMenuItem)}
      </div>
    </div>
  );
};

export default Side;
