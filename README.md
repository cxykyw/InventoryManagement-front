# 库存管理系统

这是一个基于 Vue 3 + Vite + Element Plus 构建的现代化库存管理系统，UI 设计参考了金蝶云的风格。

## 功能特性

### 1. 入库管理
- 新增/编辑/删除入库单
- 选择供应商和仓库
- 添加商品明细，自动计算金额
- 支持批量审核
- 按日期、单号、供应商等条件搜索
- 未审核单据可修改，已审核单据锁定

### 2. 出库管理
- 新增/编辑/删除出库单
- 选择客户和仓库
- 添加商品明细，自动计算金额
- 支持批量审核
- 按日期、单号、客户等条件搜索
- 未审核单据可修改，已审核单据锁定

### 3. 销售明细表
- 展示商品销售数据
- 显示销售金额、成本、毛利、毛利率
- 支持多维度搜索：
  - 日期范围
  - 商品名称
  - 客户名称
  - 销售员
- 数据分析功能：
  - 销售趋势分析
  - 商品销售分析
  - 销售员业绩分析
- 支持数据导出

### 4. 收款管理
- 新增/编辑/删除收款单
- 选择客户和收款方式
- 关联出库单
- 支持多种收款方式：
  - 现金
  - 银行转账
  - 支付宝
  - 微信
  - 其他
- 按日期、单号、客户等条件搜索
- 支持批量审核

### 5. 付款管理
- 新增/编辑/删除付款单
- 选择供应商和付款方式
- 关联入库单
- 支持多种付款方式
- 按日期、单号、供应商等条件搜索
- 支持批量审核

## 技术栈

- **前端框架**: Vue 3
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **路由管理**: Vue Router
- **HTTP 客户端**: Axios
- **图表库**: ECharts

## 项目结构

```
myproject/
├── src/
│   ├── assets/          # 静态资源
│   ├── components/      # 公共组件
│   ├── mock/           # 模拟数据
│   │   └── data.js     # 模拟数据和API
│   ├── router/         # 路由配置
│   │   └── index.js
│   ├── views/          # 页面组件
│   │   ├── StockIn.vue    # 入库管理
│   │   ├── StockOut.vue   # 出库管理
│   │   ├── SalesDetail.vue # 销售明细表
│   │   ├── Receipt.vue    # 收款单
│   │   └── Payment.vue    # 付款单
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 开发环境设置

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 构建生产版本：
```bash
npm run build
```

## 主要依赖版本

```json
{
  "dependencies": {
    "vue": "^3.3.8",
    "element-plus": "^2.4.3",
    "vue-router": "^4.2.5",
    "echarts": "^5.4.3",
    "axios": "^1.4.0"
  }
}
```

## 功能说明

### 单据处理流程

1. **新增单据**
   - 填写基本信息（日期、客户/供应商、仓库等）
   - 添加明细行
   - 保存为待审核状态

2. **审核流程**
   - 选择待审核单据
   - 点击审核按钮
   - 确认后状态变更为已审核
   - 已审核单据不可修改和删除

3. **数据分析**
   - 销售明细表提供多维度数据分析
   - 支持图表可视化展示
   - 可导出数据进行进一步分析

### 数据校验

- 必填字段验证
- 数值类型验证
- 单据状态控制
- 重复数据检查

### 用户界面

- 响应式设计
- 清晰的导航菜单
- 统一的操作风格
- 直观的数据展示
- 友好的错误提示

## 注意事项

1. 当前版本使用模拟数据，可以根据需要替换为实际的后端API
2. 所有金额计算采用精确到分的方式
3. 删除和审核等重要操作都有确认提示
4. 表格数据支持分页和排序
5. 搜索条件支持多个字段组合查询

## 后续开发计划

1. 添加用户认证和权限管理
2. 实现与后端API的集成
3. 添加更多数据分析功能
4. 优化移动端适配
5. 添加数据导入功能
6. 实现打印功能

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

[MIT License](LICENSE)