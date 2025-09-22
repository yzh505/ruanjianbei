import React, { useState } from 'react';
import styles from '../../scss/components/head.module.scss';
import logo from '../../image/logo.png';
import { useNavigate } from 'react-router-dom';
import { 
  HamburgerButton,
  Message as MessageIcon,
  User as UserIcon,
  Down as DownIcon,
  Setting as SettingIcon,
  Help as HelpIcon,
  Logout as LogoutIcon
} from '@icon-park/react';
import '@icon-park/react/styles/index.css';
import { SearchOutlined } from '@ant-design/icons';
import { Badge, Dropdown, Avatar } from 'antd';

const Head = () => {
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: '系统通知', content: '欢迎使用智能教学助手系统', time: '刚刚' },
    { id: 2, title: '课程提醒', content: '您有一个新的课程待处理', time: '10分钟前' },
    { id: 3, title: '系统更新', content: '系统将在今晚进行例行维护', time: '1小时前' }
  ];

  const messages = [
    { id: 1, user: '张老师', content: '课件已经审核完成', time: '5分钟前', avatar: 'https://xsgames.co/randomusers/avatar.php?g=pixel&key=1' },
    { id: 2, user: '李老师', content: '请查看最新的教学计划', time: '20分钟前', avatar: 'https://xsgames.co/randomusers/avatar.php?g=pixel&key=2' },
    { id: 3, user: '王老师', content: '周五教研会议别忘了', time: '1小时前', avatar: 'https://xsgames.co/randomusers/avatar.php?g=pixel&key=3' }
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: '个人信息',
      icon: <UserIcon theme="outline" size="16" />,
    },
    {
      key: 'settings',
      label: '系统设置',
      icon: <SettingIcon theme="outline" size="16" />,
    },
    {
      key: 'help',
      label: '帮助中心',
      icon: <HelpIcon theme="outline" size="16" />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutIcon theme="outline" size="16" />,
    },
  ];

  const handleNavigation = (path) => {
    navigate('/' + path);
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
  };

  const handleUserMenuClick = ({ key }) => {
    switch (key) {
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'help':
        navigate('/help');
        break;
      case 'logout':
        // 处理登出逻辑
        navigate('/login');
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.head}>
      <div className={styles.leftSection}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <div className={styles.title}>FlowPro</div>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <SearchOutlined className={styles.searchIcon} />
          <input
            className={styles.input}
            placeholder="搜索课程、资源、文档..."
            value={searchValue}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.navigation}>
          <button 
            className={`${styles.navButton} ${window.location.pathname === '/' ? styles.active : ''}`}
            onClick={() => handleNavigation('')}
          >
            首页
          </button>
          <button 
            className={`${styles.navButton} ${window.location.pathname === '/Mange' ? styles.active : ''}`}
            onClick={() => handleNavigation('Mange')}
          >
            工作台
          </button>
        </div>

        <div className={styles.tools}>
         
          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: handleUserMenuClick,
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <div className={styles.userInfo}>
              <Avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel" size={32} />
              <span className={styles.userName}>张老师</span>
              <DownIcon theme="outline" size="12" />
            </div>
          </Dropdown>

          <div className={styles.setting}>
            <HamburgerButton theme="outline" size="20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Head;