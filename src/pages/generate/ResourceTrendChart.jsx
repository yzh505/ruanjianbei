import React from 'react';
import ReactECharts from 'echarts-for-react';

const ResourceTrendChart = ({ data }) => {
  const weeks = ['本周', '前一周', '前两周', '前三周'];
  const series = data.map(item => ({
    name: item.resourceType,
    type: 'line',
    data: [item.firstWeekCount, item.secondWeekCount, item.thirdWeekCount, item.fourthWeekCount],
    smooth: true
  }));
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: data.map(item => item.resourceType) },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: weeks },
    yAxis: { type: 'value' },
    series
  };
  return <ReactECharts option={option} style={{height: '200px', width: '100%'}} />;
};

export default ResourceTrendChart;
