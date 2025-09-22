import React, { useState, useRef, useEffect } from 'react';
import styles from '../../scss/myHome.module.scss';
import Head from '../components/head';
import heroVideo from '../../image/hero-video.mp4';

const Ome = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('loadeddata', () => {
        console.log('视频加载完成');
      });
      
      // 添加错误处理
      videoRef.current.addEventListener('error', (e) => {
        console.error('视频加载错误:', e);
      });
    }
  }, []);

  return (
    <div className={styles.myHome}>
      <Head />
      <div className={styles.content}>
        <div className={styles.videoContainer}>
          <div className={styles.video}>
            <video
              ref={videoRef}
              className={styles.videoPlayer}
              controls
              width="100%"
              height="auto"
              autoPlay
              loop
              muted
              playsInline // 添加playsInline属性以支持iOS设备
            >
              <source src={heroVideo} type="video/mp4" />
              您的浏览器不支持 video 标签。
            </video>
          </div>
          <div className={styles.waves}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path className={styles.wave1} d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,128C672,107,768,85,864,90.7C960,96,1056,128,1152,133.3C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
        </div>
        <div className={styles.textContainer}>
          <h1>Foster a love of learning in every student</h1>
          <h2>Create active learning experiences students can’t wait to be a part of.</h2>
          <div className={styles.gird}>
            <div className={styles.gridItem}>
              <h3>Interactive Lessons</h3>
              <p>Engage students with interactive lessons that make learning fun.</p>
              <button className={styles.button}>
                开始探索
              </button>
            </div>
            <div className={styles.gridItem}>
              <h3>Real-World Applications</h3>
              <p>Connect classroom learning to real-world scenarios.</p>
              <button>
                开始探索
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ome;