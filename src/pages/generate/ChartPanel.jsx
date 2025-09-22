import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import styles from '../../scss/generate/courseware.module.scss';

const ChartPanel = () => {
  const pieRef = useRef(null);
  const lineRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    // 饼图
    const pieChart = echarts.init(pieRef.current);
    pieChart.setOption({
      title: { text: '课件类型分布', left: 'center', top: 10, textStyle: { fontSize: 15 } },
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [{
        type: 'pie',
        radius: '60%',
        data: [
          { value: 128, name: 'PPT' },
          { value: 56, name: '教案' },
          { value: 34, name: '流程图' },
          { value: 21, name: '试卷' }
        ]
      }]
    });
    // 折线图
    const lineChart = echarts.init(lineRef.current);
    lineChart.setOption({
      title: { text: '近一周生成趋势', left: 'center', top: 10, textStyle: { fontSize: 15 } },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['周一','周二','周三','周四','周五','周六','周日'] },
      yAxis: { type: 'value' },
      series: [{
        name: '生成数量',
        type: 'line',
        data: [12,18,9,15,20,10,8],
        smooth: true,
        lineStyle: { color: '#1890ff' },
        itemStyle: { color: '#1890ff' }
      }]
    });
    // 柱状图
    const barChart = echarts.init(barRef.current);
    barChart.setOption({
      title: { text: '各类型课件数量', left: 'center', top: 10, textStyle: { fontSize: 15 } },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['PPT','教案','流程图','试卷'] },
      yAxis: { type: 'value' },
      series: [{
        name: '数量',
        type: 'bar',
        data: [128,56,34,21],
        itemStyle: { color: '#1890ff' }
      }]
    });
    // 销毁
    return () => {
      pieChart.dispose();
      lineChart.dispose();
      barChart.dispose();
    };
  }, []);

  return (
    <div style={{display:'flex',gap:'20px',marginBottom:'20px'}}>
      <div className={styles.data} style={{width:'33%'}}>
        <div ref={pieRef} style={{width:'100%',height:'260px'}} />
      </div>
      <div className={styles.data} style={{width:'33%'}}>
        <div ref={lineRef} style={{width:'100%',height:'260px'}} />
      </div>
      <div className={styles.data} style={{width:'33%'}}>
        <div ref={barRef} style={{width:'100%',height:'260px'}} />
      </div>
    </div>
  );
};

export default ChartPanel;
