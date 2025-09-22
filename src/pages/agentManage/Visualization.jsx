import React, { useState } from 'react';
import { Card, Select, DatePicker, Statistic } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from 'recharts';
import { Peoples } from '@icon-park/react';
import styles from '../../scss/agentManage/Visualization.module.scss';

const { RangePicker } = DatePicker;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Visualization = () => {
  const [timeRange, setTimeRange] = useState([]);
  const [chartType, setChartType] = useState('line');

  // 资源使用趋势数据
  const resourceTrendData = [
    { date: '2024-01', CPU: 65, 内存: 70, 存储: 45 },
    { date: '2024-02', CPU: 68, 内存: 75, 存储: 48 },
    { date: '2024-03', CPU: 72, 内存: 80, 存储: 52 },
    { date: '2024-04', CPU: 75, 内存: 82, 存储: 55 },
    { date: '2024-05', CPU: 78, 内存: 85, 存储: 58 },
  ];

  // 资源分配数据
  const resourceAllocationData = [
    { name: 'CPU', 已分配: 75, 可用: 25 },
    { name: '内存', 已分配: 80, 可用: 20 },
    { name: '存储', 已分配: 60, 可用: 40 },
    { name: '网络', 已分配: 70, 可用: 30 },
  ];

  // 资源使用分布数据
  const resourceDistributionData = [
    { name: '计算资源', value: 35 },
    { name: '存储资源', value: 25 },
    { name: '网络资源', value: 20 },
    { name: '其他资源', value: 20 },
  ];

  const cardData = [
  {
    title: "CPU使用率",
    value: 75,
    valueStyle: { color: '#3f8600' },
    iconColor: "#FF55BF",
    statColor: '#3f8600'
  },
  {
    title: "内存使用率",
    value: 80,
    valueStyle: { color: '#cf1322' },
    iconColor: "#605BFF",
    statColor: '#cf1322'
  },
  {
    title: "存储使用率",
    value: 60,
    valueStyle: { color: '#3f8600' },
    iconColor: "#FFB700",
    statColor: '#3f8600'
  },
  {
    title: "网络使用率",
    value: 70,
    valueStyle: { color: '#3f8600' },
    iconColor: "#FF6533",
    statColor: '#3f8600'
  }
];


  return (
    <div className={styles.resourceVisualization}>
      <div className={styles.visualizationHeader}>
        <h2>Welcome</h2>
        <div className={styles.visualizationControls}>
          <RangePicker 
            onChange={(dates) => setTimeRange(dates)}
            style={{ marginRight: 16 }}
          />
          <Select
            defaultValue="line"
            style={{ width: 120 }}
            onChange={(value) => setChartType(value)}
            options={[
              { value: 'line', label: '趋势图' },
              { value: 'bar', label: '柱状图' },
              { value: 'pie', label: '饼图' },
            ]}
          />
        </div>
      </div>

      <div className={styles.statCardsContainer}>
        <div className={styles.statCards}>
          {cardData.map((item, idx) => (
            <div className={styles.statCard} key={item.title}>
              <div
                className={styles.statCardTitle}
                style={{ background: `${item.iconColor}33` }} // 33为16进制透明度约0.2
              >
                <Peoples theme="filled" size="24" fill={item.iconColor} />
              </div>
              <Statistic
                title={item.title}
                value={item.value}
                precision={2}
                valueStyle={item.valueStyle}
                prefix={<ArrowUpOutlined />}
                suffix="%"
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.chartsRows}>
        {/* 第一行 折线图+环形图 3:1 */}
        <div className={styles.row}>
          <div className={styles.lineChartWrapper}>
            <h3>资源使用趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={resourceTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="CPU" stroke="#8884d8" />
                <Line type="monotone" dataKey="内存" stroke="#82ca9d" />
                <Line type="monotone" dataKey="存储" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.pieChartWrapper}>
            <h3>资源使用分布</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={resourceDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  innerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {resourceDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* 第二行 柱状图+雷达图 3:2 */}
        <div className={styles.row}>
          <div className={styles.barChartWrapper}>
            <h3>资源分配情况</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resourceAllocationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="已分配" fill="#8884d8" />
                <Bar dataKey="可用" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.radarChartWrapper}>
            <h3>资源雷达图</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius={120} data={resourceAllocationData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis />
                <Radar name="已分配" dataKey="已分配" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Radar name="可用" dataKey="可用" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.4} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* 第三行 旭日图+面积图 1:1 */}
        <div className={styles.row}>
          <div className={styles.sunburstChartWrapper}>
            <h3>基础旭日图</h3>
            <ResponsiveContainer width="100%" height={300}>
              {/* 旭日图可用 PieChart 近似实现，设置 innerRadius/outerRadius 不同分层 */}
              <PieChart>
                <Pie
                  data={resourceDistributionData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  fill="#8884d8"
                  label
                >
                  {resourceDistributionData.map((entry, index) => (
                    <Cell key={`cell-sunburst-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.areaChartWrapper}>
            <h3>基础面积图</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={resourceTrendData}>
                <defs>
                  <linearGradient id="colorCPU" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area type="monotone" dataKey="CPU" stroke="#8884d8" fillOpacity={1} fill="url(#colorCPU)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualization;
