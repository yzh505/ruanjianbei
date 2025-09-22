import React, { useEffect, useRef, useState } from 'react';
import Head from '../components/head';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import styles from '../../scss/components/mindMap.module.scss';
import { 
  Plus,
  Close
} from '@icon-park/react';

const MindMap = ({code,setCode,zoom=1}) => {
    const svgRef = useRef(null);
    const mainGroupRef = useRef(null); // 保存主g
    // 拖动画布相关 state
    const [dragging, setDragging] = useState(false);
    const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });
    const [viewOrigin, setViewOrigin] = useState({ x: 0, y: 0 });
    const [currentTranslate, setCurrentTranslate] = useState({ x: 0, y: 0 });
    // 添加弹窗状态和表单数据
    const [showRelationModal, setShowRelationModal] = useState(false);
    const [relationForm, setRelationForm] = useState({
        startNode: '',
        endNode: '',
        relationship: ''
    });
    const [currentNode, setCurrentNode] = useState(null);
        
    const [content, setContent] = useState( [
                {
                    "entity1": "基因工程",
                    "ship": "基于",
                    "entity2": "生物化学"
                },
                {
                    "entity1": "基因工程",
                    "ship": "应用领域",
                    "entity2": "创造符合人类需要的产品"
                },
                {
                    "entity1": "基因工程",
                    "ship": "应用领域",
                    "entity2": "解决常规方法不能解决的问题"
                },
                {
                    "entity1": "基因工程",
                    "ship": "基本操作程序",
                    "entity2": "通过不同方法得到目的基因"
                },
                {
                    "entity1": "基因工程",
                    "ship": "基本操作程序",
                    "entity2": "将目的基因与基因表达所需的多种元件组装构成表达载体"
                },
                {
                    "entity1": "基因工程",
                    "ship": "基本操作程序",
                    "entity2": "将表达载体导入受体细胞"
                },
                {
                    "entity1": "基因工程",
                    "ship": "相关技术",
                    "entity2": "蛋白质工程"
                },
                {
                    "entity1": "蛋白质工程",
                    "ship": "产生背景",
                    "entity2": "基因工程只能生产自然界已存在的蛋白质，不一定完全符合人类生产和生活的需要"
                },
                {
                    "entity1": "蛋白质工程",
                    "ship": "技术手段",
                    "entity2": "基因修饰"
                },
              
    ]);

    // 从自定义输入内容生成思维导图
    const generateCustomMindMap = async () => {
       renderMindMap(code)
    };

   
    // 将三元组关系转换为思维导图结构（不影响原始数据）
    const convertToMindMapStructure = (triples) => {
        // 查找所有不同的实体
        const allEntities = new Set();
        triples.forEach(triple => {
            if (triple.entity1) allEntities.add(triple.entity1);
            if (triple.entity2) allEntities.add(triple.entity2);
        });

        // 找出作为中心节点的实体（出现频率最高的）
        const entityCounts = {};
        triples.forEach(triple => {
            if (triple.entity1) {
                entityCounts[triple.entity1] = (entityCounts[triple.entity1] || 0) + 1;
            }
            if (triple.entity2) {
                entityCounts[triple.entity2] = (entityCounts[triple.entity2] || 0) + 1;
            }
        });

        // 选择最频繁的实体作为中心
        let centralNode = Object.keys(entityCounts).reduce((a, b) => 
            entityCounts[a] > entityCounts[b] ? a : b, Object.keys(entityCounts)[0]);

        // 创建节点和连接
        const nodes = [];
        const links = [];
        
        // 添加中心节点
        nodes.push({
            id: centralNode,
            label: centralNode,
            type: 'central',
            x: 0,
            y: 0
        });

        // 为每个三元组添加节点和连接
        triples.forEach((triple, index) => {
            // 如果三元组的subject是中心节点，添加direct连接
            if (triple.entity1 === centralNode && triple.entity2) {
                // 检查节点是否已存在
                if (!nodes.some(n => n.id === triple.entity2)) {
                    nodes.push({
                        id: triple.entity2,
                        label: triple.entity2,
                        type: 'entity'
                    });
                }
                
                links.push({
                    source: triple.entity1,
                    target: triple.entity2,
                    label: triple.ship
                });
            }
            // 如果三元组的object是中心节点，添加reverse连接
            else if (triple.entity2 === centralNode && triple.entity1) {
                // 检查节点是否已存在
                if (!nodes.some(n => n.id === triple.entity1)) {
                    nodes.push({
                        id: triple.entity1,
                        label: triple.entity1,
                        type: 'entity'
                    });
                }
                
                links.push({
                    source: triple.entity2,
                    target: triple.entity1,
                    label: triple.ship
                });
            }
            // 对于不直接连接到中心节点的三元组，也添加到图中
            else if (triple.entity1 && triple.entity2) {
                // 检查节点是否已存在
                if (!nodes.some(n => n.id === triple.entity1)) {
                    nodes.push({
                        id: triple.entity1,
                        label: triple.entity1,
                        type: 'entity'
                    });
                }
                if (!nodes.some(n => n.id === triple.entity2)) {
                    nodes.push({
                        id: triple.entity2,
                        label: triple.entity2,
                        type: 'entity'
                    });
                }
                
                links.push({
                    source: triple.entity1,
                    target: triple.entity2,
                    label: triple.ship
                });
            }
        });

        return { nodes, links };
    };
    // 处理关系表单输入变化
    const handleRelationFormChange = (e) => {
        const { name, value } = e.target;
        setRelationForm({
            ...relationForm,
            [name]: value
        });
    };

    // 提交关系表单
    const handleRelationFormSubmit = () => {
        // 验证表单
        if (!relationForm.startNode || !relationForm.endNode || !relationForm.relationship) {
            alert('所有字段都必须填写');
            return;
        }

        // 添加新的三元组关系
        const newTriple = {
            entity1: relationForm.startNode,
            ship: relationForm.relationship,
            entity2: relationForm.endNode
        };

        // 添加到内容中
        setCode([...code, newTriple]);
        // 关闭弹窗并重置表单
        setShowRelationModal(false);
        setRelationForm({
            startNode: '',
            endNode: '',
            relationship: ''
        });
        renderMindMap([...code, newTriple])
    };

    // 关闭弹窗
    const closeRelationModal = () => {
        setShowRelationModal(false);
    };

    // 渲染思维导图
    const renderMindMap = (triples) => {
        if (!triples || triples.length === 0 || !svgRef.current) return;

        // 转换数据结构（不影响原始数据）
        const { nodes, links } = convertToMindMapStructure(triples);
   
           // 清除旧的SVG内容
           d3.select(svgRef.current).selectAll("*").remove();
   
        // 设置画布尺寸
        const width = 800;
        const height = 600;
        // svg 只设置宽高，内容平移交给 <g>
           const svg = d3.select(svgRef.current)
               .attr("width", width)
            .attr("height", height)
            .attr("class", styles.mindMapSvg);

        // 创建主 group 用于平移和缩放
        const mainGroup = svg.append("g")
            .attr("class", styles.mainGroup)
            .attr("transform", `translate(${currentTranslate.x},${currentTranslate.y}) scale(${zoom})`);
        mainGroupRef.current = mainGroup;
   
           // 创建箭头标记
           mainGroup.append("defs").selectAll("marker")
               .data(["arrow"])
               .enter().append("marker")
               .attr("id", "arrow")
               .attr("viewBox", "0 -5 10 10")
            .attr("refX", 25) // 调整箭头位置
               .attr("refY", 0)
               .attr("markerWidth", 8)
               .attr("markerHeight", 8)
               .attr("orient", "auto")
               .append("path")
               .attr("d", "M0,-5L10,0L0,5")
               .attr("fill", "#E6A5BC");
   
           // 创建力导向图布局
        const simulation = d3.forceSimulation(nodes)
               .force("link", d3.forceLink(links)
                   .id(d => d.id)
                .distance(150)) // 调整节点间距
            .force("charge", d3.forceManyBody().strength(-500)) // 调整节点排斥力
               .force("center", d3.forceCenter(width / 2, height / 2));
   
           // 创建连线
        const link = mainGroup.append("g")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("class", styles.link)
               .attr("stroke", "#E6A5BC")
            .attr("stroke-width", 1.5)
            .attr("marker-end", "url(#arrow)");

        // 创建连线标签组
        const linkLabelGroup = mainGroup.append("g")
            .selectAll("g")
            .data(links)
            .enter().append("g")
            .attr("class", "link-label-group");

        // 添加连线标签背景
        linkLabelGroup.append("rect")
            .attr("class", styles.linkLabelBg)
               .attr("rx", 4)
               .attr("ry", 4)
               .attr("fill", "white")
            .attr("stroke", "#E6A5BC")
            .attr("stroke-width", 0.5);

        // 添加连线标签文本
        const linkLabel = linkLabelGroup.append("text")
            .attr("class", styles.linkLabel)
            .attr("dy", ".35em")
               .attr("text-anchor", "middle")
            .text(d => d.label)
               .attr("fill", "#666")
            .style("font-size", "12px");

        // 动态设置标签背景尺寸
        linkLabelGroup.selectAll("rect")
            .attr("width", function() {
                const textWidth = this.parentNode.querySelector("text").getComputedTextLength();
                return textWidth + 10;
            })
            .attr("height", 20)
            .attr("x", function() {
                const textWidth = this.parentNode.querySelector("text").getComputedTextLength();
                return -textWidth / 2 - 5;
            })
            .attr("y", -10);
   
           // 创建节点组
        const nodeGroup = mainGroup.append("g")
               .selectAll("g")
            .data(nodes)
            .enter().append("g")
            .attr("class", d => d.type === 'central' ? styles.centralNode : styles.entityNode)
               .call(d3.drag()
                   .on("start", dragstarted)
                   .on("drag", dragged)
                   .on("end", dragended));
   
        // 根据节点类型设置不同的样式
        const getNodeColor = (node) => {
            if (node.type === 'central') return "#C990C0"; // 中心节点颜色
            return "#86B0D9"; // 普通节点颜色
        };

        const getNodeRadius = (node) => {
            if (node.type === 'central') return 30; // 中心节点更大
            return 25; // 普通节点
        };
   
           // 添加节点圆形背景
        nodeGroup.append("circle")
            .attr("r", d => getNodeRadius(d))
            .attr("class", d => d.type === 'central' ? styles.centralNode : styles.entityNode);
   
           // 添加节点文本
        nodeGroup.append("text")
            .text(d => d.label)
            .attr("class", d => d.type === 'central' ? `${styles.nodeText} ${styles.centralNodeText}` : styles.nodeText)
               .attr("dy", ".35em")
            .style("font-size", d => {
                return d.label?.length > 5 ? "10px" : "12px";
            });
   
           // 添加节点标题提示
        nodeGroup.append("title")
            .text(d => d.label);

        // 添加"+"符号的圆形背景
        nodeGroup.append("circle")
            .attr("class", styles.addButtonCircle)
            .attr("cx", d => d.type === 'central' ? 30 : 20)
            .attr("cy", d => d.type === 'central' ? -50 : -50)
            .attr("r", d => d.type === 'central' ? 7 : 6)
            .attr("fill", "#fff")
            .attr("stroke", "#D17BA5")
            .attr("stroke-width", 1)
            .style("cursor", "pointer")
            .style("pointer-events", "all") // 确保可以点击
            .on("click", function(event, d) { // 使用正确的d3 v6事件处理方式
                // 阻止事件冒泡，避免触发节点拖拽
                event.stopPropagation();
                console.log("111", d);
                
                // 打开关系弹窗，并设置起始节点
                setCurrentNode(d);
                setRelationForm({
                    startNode: d.label,
                    endNode: '',
                    relationship: ''
                });
                setShowRelationModal(true);
            });
        
           // 添加"+"符号
        nodeGroup.append("text")
               .attr("class", styles.addButtonText)
            .attr("x", d => d.type === 'central' ? 30 : 20)
            .attr("y", d => d.type === 'central' ? -50 : -50)
               .attr("dy", ".35em")
               .attr("text-anchor", "middle")
               .attr("fill", "#D17BA5")
            .style("font-size", d => d.type === 'central' ? "16px" : "14px")
            .style("font-weight", "bold")
            .style("pointer-events", "none") // 防止文本拦截点击事件
               .text("+");

   
           // 更新力导向图
           simulation.on("tick", () => {
               // 更新连线位置
            link
                   .attr("x1", d => d.source.x)
                   .attr("y1", d => d.source.y)
                   .attr("x2", d => d.target.x)
                   .attr("y2", d => d.target.y);
   
            // 更新连线标签位置
            linkLabelGroup
                   .attr("transform", d => {
                    const midX = (d.source.x + d.target.x) / 2;
                    const midY = (d.source.y + d.target.y) / 2;
                    return `translate(${midX}, ${midY})`;
                   });
   
               // 更新节点位置
            nodeGroup
                .attr("transform", d => `translate(${d.x}, ${d.y})`);
           });
   
           // 拖拽事件处理函数
           function dragstarted(event, d) {
               if (!event.active) simulation.alphaTarget(0.3).restart();
               d.fx = d.x;
               d.fy = d.y;
           }
   
           function dragged(event, d) {
               d.fx = event.x;
               d.fy = event.y;
           }
   
           function dragended(event, d) {
               if (!event.active) simulation.alphaTarget(0);
               d.fx = null;
               d.fy = null;
           }
    };

    // 拖动画布事件
    const handleMouseDown = (e) => {
        // 防止拖拽时全选文本
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
        e.preventDefault();
        setDragging(true);
        setDragOrigin({ x: e.clientX, y: e.clientY });
        setViewOrigin({ ...currentTranslate });
    };
    const handleMouseMove = (e) => {
        if (!dragging) return;
        e.preventDefault();
        const dx = e.clientX - dragOrigin.x;
        const dy = e.clientY - dragOrigin.y;
        setCurrentTranslate({ x: viewOrigin.x + dx, y: viewOrigin.y + dy });
    };
    const handleMouseUp = () => {
        setDragging(false);
    };
    // 监听拖拽事件
    useEffect(() => {
        if (!dragging) return;
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, dragOrigin, viewOrigin]);
    // 拖动画布时只更新 transform
    useEffect(() => {
      if (mainGroupRef.current) {
        mainGroupRef.current.attr('transform', `translate(${currentTranslate.x},${currentTranslate.y}) scale(${zoom})`);
      }
    }, [currentTranslate, zoom]);
    // 只在 code 变化时重建
    useEffect(() => {
        generateCustomMindMap();
    }, [code]);

    return (    
        <div className={styles.mindMapContainer + ' ' + styles.draggableContainer}
            onMouseDown={handleMouseDown}
            style={{ cursor: dragging ? 'grabbing' : 'grab', width: '100%', height: '600px', overflow: 'hidden' }}
        >
            <div className={styles.previewContent}>
                {code ? (
                    <svg ref={svgRef} className={styles.svg}></svg>
                ) : (
                    <div className={styles.emptyState}>
                        <p>请选择文档并生成思维导图</p>
                    </div>
                )}
            </div>
            {/* 添加关系弹窗 */}
            {showRelationModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>添加关系</h3>
                            <button 
                                className={styles.closeButton}
                                onClick={closeRelationModal}
                            >
                                <Close size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label htmlFor="startNode">起始节点</label>
                                <input 
                                    type="text" 
                                    id="startNode" 
                                    name="startNode"
                                    value={relationForm.startNode}
                                    onChange={handleRelationFormChange}
                                    readOnly={!!currentNode}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="relationship">关系</label>
                                <input 
                                    type="text" 
                                    id="relationship" 
                                    name="relationship"
                                    value={relationForm.relationship}
                                    onChange={handleRelationFormChange}
                                    placeholder="例如：基于、包含、属于"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="endNode">结束节点</label>
                                <input 
                                    type="text" 
                                    id="endNode" 
                                    name="endNode"
                                    value={relationForm.endNode}
                                    onChange={handleRelationFormChange}
                                    placeholder="输入新节点名称或选择现有节点"
                                />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button 
                                className={styles.cancelButton}
                                onClick={closeRelationModal}
                            >
                                取消
                            </button>
                            <button 
                                className={styles.submitButton}
                                onClick={handleRelationFormSubmit}
                            >
                                <Plus size={16} />
                                添加
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MindMap;