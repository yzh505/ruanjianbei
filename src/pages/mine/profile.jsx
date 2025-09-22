import React, { useState ,useEffect} from 'react';
import { Edit, User, Mail, Phone, Book, FileSuccess, Crown, Chart } from '@icon-park/react';
import { Button, message, Progress, Upload } from 'antd';
import ReactEcharts from 'echarts-for-react';
import styles from '../../scss/mine/profile.module.scss';
import Head from '../components/head';
import {uploadFile,getUserInfo,updateUser} from '../../api/user'
import { setPPTTipic ,generatePPT} from '../../api/courseware';
const Profile = () => {
  // 模拟用户数据
  const user = localStorage.getItem('user');
  const [userInfo,setUserInfo] = useState(JSON.parse(user));
  // 模拟统计数据
  const [stats] = useState({
    totalPPT: 156,
    totalCourses: 23,
    completedTasks: 89,
    ranking: 5
  });

  // 模拟周活动数据
  const weeklyActivityOption = {
    title: {
      text: '本周活动统计',
      left: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [12, 8, 15, 10, 7, 11, 13],
      type: 'line',
      smooth: true,
      areaStyle: {
        opacity: 0.3
      },
      itemStyle: {
        color: '#389DFA'
      }
    }]
  };

  // 模拟资源分布数据
  const resourceDistOption = {
    title: {
      text: '资源类型分布',
      left: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [{
      type: 'pie',
      radius: '50%',
      data: [
        { value: 45, name: 'PPT' },
        { value: 25, name: '教案' },
        { value: 20, name: '习题' },
        { value: 10, name: '其他' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...userInfo });

  const handleEditSubmit = () => {
   
    setIsEditing(false);
    message.success('个人信息更新成功！');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理头像上传
  const handleAvatarUpload = async (file) => {
    try {
      // 这里应该调用实际的上传API
      // 现在我们使用FileReader来预览
      const reader = new FileReader();
      reader.readAsDataURL(file);
      const formData1 = new FormData();
      formData1.append('file', file);
      const result = await uploadFile(formData1);
      await updateUser({head: result.data.data.fileUrl});
      fetchUserData();
      return false; // 阻止自动上传
    } catch (error) {
      message.error('头像上传失败，请重试！');
      return false;
    }
  };

  // 头像上传前的校验
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的图片！');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB！');
      return false;
    }
    return true;
  };
const fetchUserData = async () => {
  const user =await getUserInfo();
  console.log(user);
  setUserInfo(user.data.data);
}

useEffect(() => {
  fetchUserData();
}, []);
  return (
    <div className={styles.profile}>
      <Head title="个人中心" />
      <div className={styles.profileContainer}>
        <div className={styles.leftSection}>
          <div className={styles.profileCard}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarWrapper}>
                <img src={userInfo.head} alt="用户头像" className={styles.avatar} />
                <Upload
                  accept="image/png, image/jpeg"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  customRequest={({ file }) => handleAvatarUpload(file)}
                  className={styles.avatarUpload}
                >
                  <div className={styles.avatarOverlay}>
                    <Edit theme="outline" size="24" />
                    <span>更换头像</span>
                  </div>
                </Upload>
              </div>
              <div className={styles.userRole}>{userInfo.role}</div>
            </div>
            
            {!isEditing ? (
              <div className={styles.infoSection}>
                <div className={styles.infoHeader}>
                  <h2>个人信息</h2>
                  <Button 
                    type="text" 
                    icon={<Edit theme="outline" size="18" />}
                    onClick={() => setIsEditing(true)}
                  >
                    编辑
                  </Button>
                </div>
                <div className={styles.infoItem}>
                  <User theme="outline" size="18" />
                  <span className={styles.label}>姓名：</span>
                  <span>{userInfo.name}</span>
                </div>
                <div className={styles.infoItem}>
                  <Mail theme="outline" size="18" />
                  <span className={styles.label}>邮箱：</span>
                  <span>{userInfo.email}</span>
                </div>
                <div className={styles.infoItem}>
                  <Phone theme="outline" size="18" />
                  <span className={styles.label}>介绍：</span>
                  <span>{userInfo.introduction}</span>
                </div>
              </div>
            ) : (
              <div className={styles.editForm}>
                <div className={styles.infoHeader}>
                  <h2>编辑信息</h2>
                </div>
                <div className={styles.formGroup}>
                  <label>姓名</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>邮箱</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>介绍</label>
                  <input
                    type="text"
                    name="phone"
                    value={editForm.introduction}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.buttonGroup}>
                  <Button onClick={() => setIsEditing(false)}>取消</Button>
                  <Button type="primary" onClick={handleEditSubmit}>保存</Button>
                </div>
              </div>
            )}

            <div className={styles.performanceSection}>
              <h3>绩效指标</h3>
              <div className={styles.progressItem}>
                <div className={styles.progressHeader}>
                  <span>任务完成率</span>
                  <span>{userInfo.completionRate}%</span>
                </div>
                <Progress percent={userInfo.completionRate} strokeColor="#389DFA" />
              </div>
              <div className={styles.progressItem}>
                <div className={styles.progressHeader}>
                  <span>综合评分</span>
                  <span>{userInfo.totalScore}</span>
                </div>
                <Progress percent={userInfo.totalScore} strokeColor="#52c41a" />
              </div>
            
            </div>
          </div>
        </div>
        <div className={styles.rightSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statsCard}>
              <div className={styles.statsIcon}>
                <FileSuccess theme="outline" size="24" />
              </div>
              <div className={styles.statsInfo}>
                <div className={styles.statsValue}>{stats.totalPPT}</div>
                <div className={styles.statsLabel}>PPT总数</div>
              </div>
            </div>
            <div className={styles.statsCard}>
              <div className={styles.statsIcon}>
                <Book theme="outline" size="24" />
              </div>
              <div className={styles.statsInfo}>
                <div className={styles.statsValue}>{stats.totalCourses}</div>
                <div className={styles.statsLabel}>课程总数</div>
              </div>
            </div>
            <div className={styles.statsCard}>
              <div className={styles.statsIcon}>
                <Crown theme="outline" size="24" />
              </div>
              <div className={styles.statsInfo}>
                <div className={styles.statsValue}>Top {stats.ranking}</div>
                <div className={styles.statsLabel}>排名</div>
              </div>
            </div>
          </div>

          <div className={styles.chartsSection}>
            <div className={styles.chartCard}>
              <ReactEcharts option={weeklyActivityOption} style={{height: '300px'}} />
            </div>
            <div className={styles.chartCard}>
              <ReactEcharts option={resourceDistOption} style={{height: '300px'}} />
            </div>
          </div>

          <div className={styles.activitySection}>
            <h3>近期活动</h3>
            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <div className={styles.timelineDot} />
                <div className={styles.timelineContent}>
                  <div className={styles.timelineTitle}>生成了新的PPT</div>
                  <div className={styles.timelineTime}>2小时前</div>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timelineDot} />
                <div className={styles.timelineContent}>
                  <div className={styles.timelineTitle}>更新了课程内容</div>
                  <div className={styles.timelineTime}>昨天</div>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timelineDot} />
                <div className={styles.timelineContent}>
                  <div className={styles.timelineTitle}>完成了教案编写</div>
                  <div className={styles.timelineTime}>2天前</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
