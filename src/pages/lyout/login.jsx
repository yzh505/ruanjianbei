// Login.jsx
import React, { useState, useRef, useEffect } from 'react';
import styles from '../../scss/login.module.scss';
import { Robot, Help, Close, Wechat, TencentQq, User, Lock, Mail, Key } from '@icon-park/react';
import '@icon-park/react/styles/index.css';
import { Flex, Radio, message } from 'antd';
import { useRequest } from '../../hooks/useRequest';
import { login, register, sendVerifyCode } from '../../api/user';
import { useNavigate } from 'react-router-dom';
import heroVideo from '../../image/hero-video.mp4';

const Login = () => {
  const { sendRequest, loading, error } = useRequest();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLoginModal1, setShowLoginModal1] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [enrollData, setEnrollData] = useState({
    name: '',
    password: '',
    email: '',
    role: '1',
    verifyCode: '',
    gender: 'male'
  });

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  const handleLoginClick1 = () => {
    setShowLoginModal1(true);
  };

  const handleCloseModal1 = () => {
    setShowLoginModal1(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEnrollChange = (e) => {
    const { name, value } = e.target;
    setEnrollData({ ...enrollData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(formData);
      const tokenHeader = result.headers.get('authorization');
      console.log(result.data);
      if (tokenHeader) {
        localStorage.setItem('user', JSON.stringify(result.data.data));
        message.success(result.data.msg);
        
        if(result.data.data.role === 0) {
          navigate('/student/dashboard');
        } else {
          navigate('/');
        }
        handleCloseModal();
      } else {
        message.error('登录失败：未获取到 token');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        message.error(error.response.data.msg);
      } else {
        message.error('登录失败，请稍后再试');
      }
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await sendRequest(register, enrollData);
      message.success(result.data.msg);
      handleCloseModal1();
    } catch (error) {
      message.error('注册失败，请稍后再试');
    }
  };

  const sendCode = async () => {
    try {
      const result = await sendRequest(sendVerifyCode, enrollData.email);
      message.success(result.data.msg);
    } catch (error) {
      if (error.response && error.response.data) {
        message.error(error.response.data.msg);
      } else {
        message.error('发送验证码失败，请稍后再试');
      }
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.bg}>
        <div className={styles.gradientOverlay}></div>
      </div>
      
      <div className={styles.top}>
        <div className={styles.title}>
          <Robot theme="outline" size="30" className={styles.titleIcon} />
          AI教学资源准备
        </div>
        <div className={styles.login}>
          <Help theme="outline" size="20" className={styles.helpIcon} />
          <div className={styles.loginButton} onClick={handleLoginClick}>登录</div>
          <div className={styles.loginButton1} onClick={handleLoginClick1}>注册</div>
        </div>
      </div>

      <div className={styles.main}>
        <h1 className={styles.mainTitle}>智能化教学与科研</h1>
        <h2 className={styles.mainSubtitle}>贴合真实场景 · 生成精准内容</h2>
        <div className={styles.features}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <Robot theme="outline" size="32" />
            </div>
            <h1>智能生成</h1>
            <p>基于AI技术，快速生成教学资源</p>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <Mail theme="outline" size="32" />
            </div>
            <h1>资源丰富</h1>
            <p>海量教学资源，一键获取</p>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <Key theme="outline" size="32" />
            </div>
            <h1>便捷高效</h1>
            <p>智能分析，提升教学效率</p>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <button className={styles.startButton} onClick={handleLoginClick}>
          立即探索
          <span className={styles.buttonArrow}>→</span>
        </button>
      </div>

      {showLoginModal && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={handleCloseModal}>
              <Close theme="outline" size={20} />
            </button>
            <h2 className={styles.modalTitle}>用户登录</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <div className={styles.inputIcon}>
                  <User theme="outline" size="20" />
                </div>
                <input
                  type="text"
                  name="username"
                  placeholder="请输入用户名"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <div className={styles.inputIcon}>
                  <Lock theme="outline" size="20" />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="请输入密码"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.extraActions}>
                <a href="/forgot-password">忘记密码？</a>
                <a onClick={() => {
                  handleCloseModal();
                  handleLoginClick1();
                }}>立即注册</a>
              </div>
              <button type="submit" className={styles.submitButton}>
                {loading ? '登录中...' : '登录'}
              </button>

              <div className={styles.divider}>使用第三方账号登录</div>

              <div className={styles.socialLogin}>
                <div className={styles.socialIcon}>
                  <Wechat theme="outline" size="28" fill="#fff"/>
                </div>
                <div className={styles.socialIcon}>
                  <TencentQq theme="outline" size="28" fill="#fff"/>
                </div>
                <div className={styles.socialIcon}>
                  <Robot theme="outline" size="28" fill="#fff"/>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLoginModal1 && (
        <div className={styles.modal} onClick={handleCloseModal1}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={handleCloseModal1}>
              <Close theme="outline" size={20} />
            </button>
            <h2 className={styles.modalTitle}>用户注册</h2>
            <form onSubmit={handleEnrollSubmit}>
              <div className={styles.formGroup}>
                <div className={styles.inputIcon}>
                  <User theme="outline" size="20" />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="请输入用户名"
                  value={enrollData.name}
                  onChange={handleEnrollChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <div className={styles.inputIcon}>
                  <Lock theme="outline" size="20" />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="请输入密码"
                  value={enrollData.password}
                  onChange={handleEnrollChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <div className={styles.inputIcon}>
                  <Mail theme="outline" size="20" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="请输入邮箱"
                  value={enrollData.email}
                  onChange={handleEnrollChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <div className={styles.verifyCodeWrapper}>
                  <div className={styles.inputIcon}>
                    <Key theme="outline" size="20" />
                  </div>
                  <input
                    type="text"
                    name="verifyCode"
                    placeholder="请输入验证码"
                    value={enrollData.verifyCode}
                    onChange={handleEnrollChange}
                    className={styles.verifyCodeInput}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={sendCode} 
                    className={styles.verifyCodeButton}
                  >
                    获取验证码
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.submitButton}>
                {loading ? '注册中...' : '注册'}
              </button>
              
              <div className={styles.loginLink}>
                已有账号？<a onClick={() => {
                  handleCloseModal1();
                  handleLoginClick();
                }}>立即登录</a>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;