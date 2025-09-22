import React, { useState, useRef, useEffect } from 'react'
import styles from '../../scss/Modules.module.scss';
import '@icon-park/react/styles/index.css';
import { FileOutlined, UserOutlined, BookOutlined, PlayCircleOutlined } from '@ant-design/icons';
import Data from '../../image/data.png'
import { useParams,useNavigate } from 'react-router-dom';
import {BookOpen,FilePdf,Edit}from '@icon-park/react'
const Modules = () => {
    const navigate = useNavigate(); // 初始化 navigate
    const dataItems = [
    {
      id: 1,
      name: '课件总数',
      value: '256',
      icon: <FileOutlined />,
      color: 'linear-gradient(90deg, rgba(252, 149, 149, 1) 0%, rgba(160, 57, 204, 0.43) 100%)',
      growth: '+12%',
      dec: '课件数量较上月增长12%'
    },
    {
      id: 2,
      name: '用户数量',
      value: '1,280',
      icon: <UserOutlined />,
      color: 'linear-gradient(138.2deg, rgba(163, 252, 149, 1) 0%, rgba(145, 250, 224, 0.96) 5.56%, rgba(64, 199, 82, 0.38) 94.45%, rgba(137, 71, 181, 0.01) 100%, rgba(57, 167, 204, 0.33) 100%)',
      growth: '+25%',
      dec: '用户数量较上月增长25%'
    },
    {
      id: 3,
      name: '资源总数',
      value: '386',
      icon: <BookOutlined />,
      color: 'linear-gradient(138.2deg, rgba(251, 252, 149, 1) 0%, rgba(204, 77, 57, 0.33) 100%)',
      growth: '+18%',
      dec: '资源总数较上月增长18%'
    },
    ];
    useEffect(() => {
     
    }, []);



  return (
    <div className={styles.modules}>
      <div className={styles.dataBoard}> 
        {dataItems.map((item) => (
          <div className={styles.dataItem} key={item.id} style={{ background: item.color }}>
            <div className={styles.content}>
                <div className={styles.top}>
                    <div className={styles.value}>{item.value}</div>
                    <img src={Data} alt={item.name} className={styles.img} />
                </div>
                <div className={styles.bottom}>
                    <div className={styles.icon}>{item.icon}</div>
                    <div className={styles.name}>{item.name}</div>
                </div>
                <div className={styles.dec}>{item.dec}</div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.navContainer}>
        <button className={styles.navBtn}>资源生成</button>
        <button className={styles.navBtn}>智能管理</button>
        <button className={styles.navBtn}>智能评估</button>
        <button className={styles.navBtn}>个性推荐</button>
      </div>
      <div className={styles.Content}>

      </div>
    </div>
  );
};

export default Modules;