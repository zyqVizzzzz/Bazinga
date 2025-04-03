# 核心概念：

1. 数据结构

- Scene（场景）：包含多个 Block
- Block（块）：基本内容单位，有以下几种类型：
  - 原文块：存储原始文本
  - 翻译块：与原文块关联的翻译
  - 知识点块：与原文块关联的知识点
  - 标题块：场景标题

2. 数据管理

- blocksMap：全局存储所有块的 Map
- scenes：场景数组
- currentScene：当前场景
- currentSceneBlocks：当前场景的块数组
- sceneStructure：场景结构（不含具体内容）

3. 数据流转

- Editor -> Scene：编辑器内容变化时，解析内容生成场景结构
- Scene -> Card：场景结构变化时，更新右侧卡片视图
- Knowledge -> Block：知识点更新时，重新应用高亮到相关块

4. 核心功能模块

- BlockManager：
  - 创建、更新、删除块
  - 管理块之间的关联关系
  - 维护 blocksMap
- SceneManager：
  - 场景的创建和切换
  - 维护场景结构
  - 同步场景内容
- KnowledgeManager：
  - 知识点的生成和管理
  - 知识点高亮处理
  - 知识点块的创建和更新

5. 状态同步机制

- 编辑器更新触发场景更新
- 场景更新触发卡片视图更新
- 知识点更新触发块内容更新

# 组件结构

CardEditor/
├── components/
│ ├── Editor/
│ │ ├── EditorJS.vue // 编辑器组件
│ │ └── EditorToolbar.vue // 编辑器工具栏
│ ├── Card/
│ │ ├── CardView.vue // 右侧卡片视图
│ │ ├── BlockItem.vue // 块显示组件
│ │ └── BlockToolbar.vue // 块操作工具栏
│ └── Common/
│ ├── KnowledgeModal.vue // 知识点生成弹窗
│ └── ImportDialog.vue // 导入对话框
├── stores/
│ ├── editor.js // 编辑器状态管理
│ ├── scenes.js // 场景数据管理
│ └── knowledge.js // 知识点数据管理
├── utils/
│ ├── blockManager.js // 块管理工具
│ ├── sceneManager.js // 场景管理工具
│ └── knowledgeManager.js // 知识点管理工具
└── CardEditor.vue // 主组件

## EditorJS

1. EditorJS 组件：

- 初始化编辑器实例
- 处理内容更新
- 向父组件发送内容变更事件

## CardView

1. CardView 组件：

- 显示场景标题和内容
- 提供场景切换功能
- 处理块的选择和点击
- 提供翻译等工具按钮

## BlockItem.vue

实现功能:

- 块类型的样式区分：

- 标题：加粗显示
- 翻译：斜体灰色
- 知识点：带左边框和背景色
- 旁白：主题色显示
- 说话者显示：

- 对于带说话者的块，显示说话者标签
- 标签使用独立的样式
- 内容渲染：

- 支持 HTML 内容（用于知识点高亮）
- 优先使用 displayText，回退到 text
- 交互效果：

- 鼠标悬停效果
- 选中状态样式
- 点击事件传递
- 知识点高亮样式：

- 使用粉色背景和深色文字
- 圆角和内边距美化

## 三个 store 分别管理：

1. editor.js：

   - 编辑器实例
   - 视图模式
   - 加载状态
   - 未保存更改状态

2. scenes.js：

   - 场景数据
   - 块管理
   - 说话者管理
   - 场景结构

3. knowledge.js：

   - 知识点数据
   - 处理状态
   - 选中状态
   - 翻译和生成状态

## 三个管理器

1. BlockManager：

- 块的创建、更新、删除
- 特殊块（翻译、知识点）的创建

2. SceneManager：

- 场景的创建和更新
- 场景结构的维护
- 场景块的重建

3. KnowledgeManager：

- 知识点的添加和管理
- 文本高亮处理
- 高亮状态重置

# 事件处理

1. 编辑器事件

- onEditorChange：编辑器内容变化
- onSceneSwitch：场景切换
- onBlockDelete：块删除

2. 知识点事件

- onKnowledgeGenerate：生成知识点
- onKnowledgeHighlight：应用知识点高亮
- onKnowledgeUpdate：更新知识点

3. 块操作事件

- onBlockCreate：创建新块
- onBlockUpdate：更新块内容
- onBlockDelete：删除块

# 数据持久化

1. 本地存储

- 编辑器临时内容
- 用户偏好设置
- 说话者列表

2. 远程存储

- 场景数据
- 知识点数据
- 翻译内容

# 块操作规则

1. 块选择

- 点击块时触发 block-click 事件
- 选中状态由 selectedBlockIndex 维护
- 选中后显示 BlockToolbar
- 通过 scenesStore.setSelectedBlock 同步状态

2. 块工具栏操作

- 翻译：对当前选中块进行翻译
- 知识点生成：打开知识点生成弹窗
- 注释标记：切换块的注释状态
- 说话者选择：为对话块设置说话者

3. 块状态同步

- 块状态变更需同时更新 blocksMap
- 关联块（翻译/知识点）需保持 ID 对应关系
- 块更新后需触发场景重绘

# 组件交互规则

1. CardView 与 CardEditor

- CardView 负责展示和块选择
- CardEditor 负责状态管理和事件处理
- 通过 emit 向上传递事件
- 通过 props 向下传递数据

2. BlockToolbar 与 CardView

- 由 CardView 控制显示状态
- 工具栏事件通过 CardView 转发
- 共享选中块的状态

3. 状态管理职责

- scenesStore：场景和块的状态
- editorStore：编辑器状态
- 组件内部状态：仅维护 UI 相关状态

## 界面交互组件

1. 悬浮按钮组 (fixed-action-buttons)：

- 位置：固定在页面右下角
- 按钮类型：
  - 退出按钮：返回预览页面
  - 保存按钮：保存当前编辑内容
  - 视图切换按钮：切换编辑器显示模式（both/editor/card）
  - 使用说明按钮：打开使用指南弹窗
- 样式规范：
  - 使用 retro-btn 复古按钮样式
  - 包含 tooltip 提示
  - 统一使用 Bootstrap Icons
- 状态管理：
  - isCustom 控制按钮启用状态
  - viewMode 控制视图切换图标

2. 按钮交互规则：

- 退出前检查未保存更改
- 保存操作需等待完成后才能继续操作
- 视图切换实时生效
- 使用说明随时可查看
