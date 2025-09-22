import React, { useState, useRef, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import '@icon-park/react/styles/index.css';
import styles from '../../../scss/generate/PPT/PPT.module.scss'; // 引入 SCSS 模块
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'

//图标
Modal.setAppElement('#root');
const LessonPlanManager = () => {

useEffect(() => {

}, []);
  return (
    <div className={styles.PPT}>
     
    </div>
  );
};

export default LessonPlanManager;