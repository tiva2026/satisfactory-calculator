# Satisfactory 生产计算器前端 - Mobile-First UI

## 📱 项目概述

这是一个基于 **Next.js App Router** 和 **Tailwind CSS** 构建的移动优先 Satisfactory 生产计算器前端界面。

## 🎯 核心功能

### ✅ 已完成的功能

1. **顶部输入区域**
   - 物品选择下拉框（支持 `mDisplayName` 显示）
   - 目标生产速率数值输入（Items/min）
   - 响应式计算按钮

2. **中部生产流水线视图**
   - 移动优先的卡片流布局（Card-Flow Pipeline）
   - 递归渲染 `ProductionNode` 树结构
   - 每张卡片显示：
     - 建筑名称和数量
     - 左侧：输入原料及速率
     - 右侧：输出产物及速率
     - 垂直方向指示箭头

3. **底部统计网格**
   - 原始资源需求汇总（`rawResources`）
   - 总功耗显示（`totalPower` MW）

4. **购物清单部件**
   - 建筑材料需求网格
   - 基于机器数量的总计

5. **广告位占位**
   - 底部粘性广告横幅
   - 联盟链接部件

## 📂 文件结构

```
satisfactory-data/
├── app/
│   ├── calc/
│   │   └── page.tsx          # 主计算器页面组件
│   ├── layout.tsx             # Next.js 根布局
│   └── globals.css            # Tailwind CSS 全局样式
├── src/
│   └── lib/
│       └── production-calculator.ts  # 核心计算引擎
├── package.json               # 项目依赖
├── tsconfig.json             # TypeScript 配置
├── tailwind.config.js        # Tailwind CSS 配置
└── postcss.config.js         # PostCSS 配置
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000/calc](http://localhost:3000/calc) 查看计算器页面。

### 3. 构建生产版本

```bash
npm run build
npm start
```

## 🎨 设计特性

### 移动优先设计原则

- **触摸优化**：所有按钮和输入框均为触摸友好尺寸
- **防止缩放**：输入框字体 ≥16px 防止 iOS Safari 自动放大
- **垂直布局**：避免横向滚动，所有内容采用单列垂直流
- **卡片式设计**：清晰的视觉层次和信息分组

### Tailwind CSS 实用类应用

- **响应式断点**：`xs:375px`, `sm:640px`, `md:768px`, `lg:1024px`
- **渐变背景**：`bg-gradient-to-br from-slate-50 to-slate-100`
- **阴影效果**：`shadow-md`, `shadow-lg`, `shadow-2xl`
- **粘性定位**：`sticky top-0`, `sticky bottom-0`
- **过渡动画**：`transition-all`, `hover:`, `active:scale-95`

## 🔧 核心组件说明

### app/calc/page.tsx

**客户端组件**（`'use client'`）

#### 关键函数

- **handleCalculate()**：执行生产树计算
- **renderProductionNode()**：递归渲染生产节点卡片
- **availableItems**：可选物品列表（通过 useMemo 优化）

## 📊 数据流

```
用户输入 (selectedItem, targetRate)
    ↓
calculateFullProductionTree()
    ↓
ProductionTreeResult
    ↓
UI 渲染（递归展示生产树）
```

## 🛠️ 待完成任务

- [ ] 从 JSON 文件加载真实游戏数据
- [ ] 实现配方选择器
- [ ] 添加搜索过滤功能
- [ ] 实现生产树折叠/展开
- [ ] 添加导出功能
- [ ] 集成真实广告

## 📝 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript 5.4+
- **样式**: Tailwind CSS 3.4+
- **UI 库**: React 18.3+

---

**构建日期**: 2026-07-05
