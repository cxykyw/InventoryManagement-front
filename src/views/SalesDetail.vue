`<template>
  <div class="sales-detail">
    <el-card class="box-card">
      <!-- 顶部操作栏 -->
      <div class="operation-bar">
        <el-button type="primary" @click="handleExport">导出明细</el-button>
        <el-button type="success" @click="handleAnalysis">数据分析</el-button>
      </div>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item label="商品名称">
            <el-input v-model="searchForm.productName" placeholder="请输入商品名称" />
          </el-form-item>
          <el-form-item label="客户名称">
            <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" />
          </el-form-item>
          <el-form-item label="销售员">
            <el-input v-model="searchForm.salespersonName" placeholder="请输入销售员姓名" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 统计信息 -->
      <div class="statistics-area">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>销售总额</span>
                </div>
              </template>
              <div class="statistic-value">¥{{ statistics.totalAmount }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>销售成本</span>
                </div>
              </template>
              <div class="statistic-value">¥{{ statistics.totalCost }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>毛利总额</span>
                </div>
              </template>
              <div class="statistic-value">¥{{ statistics.totalProfit }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>平均毛利率</span>
                </div>
              </template>
              <div class="statistic-value">{{ statistics.avgProfitRate }}%</div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 表格区域 -->
      <el-table
        :data="tableData"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column type="index" width="50" label="序号" />
        <el-table-column prop="date" label="日期" width="120" sortable />
        <el-table-column prop="documentNo" label="单据编号" width="150" />
        <el-table-column prop="productName" label="商品名称" width="150" />
        <el-table-column prop="customerName" label="客户名称" width="120" />
        <el-table-column prop="salespersonName" label="销售员" width="100" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="quantity" label="数量" width="100" align="right" sortable />
        <el-table-column prop="price" label="单价" width="120" align="right">
          <template #default="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120" align="right" sortable>
          <template #default="scope">
            ¥{{ scope.row.amount }}
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="成本" width="120" align="right">
          <template #default="scope">
            ¥{{ scope.row.cost }}
          </template>
        </el-table-column>
        <el-table-column prop="profit" label="毛利" width="120" align="right" sortable>
          <template #default="scope">
            ¥{{ scope.row.profit }}
          </template>
        </el-table-column>
        <el-table-column prop="profitRate" label="毛利率" width="120" align="right" sortable>
          <template #default="scope">
            {{ scope.row.profitRate }}%
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 数据分析对话框 -->
    <el-dialog
      title="销售数据分析"
      v-model="analysisVisible"
      width="80%"
    >
      <div class="analysis-content">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="销售趋势" name="trend">
            <div class="chart-container">
              <div ref="trendChart" style="width: 100%; height: 400px;"></div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="商品分析" name="product">
            <div class="chart-container">
              <div ref="productChart" style="width: 100%; height: 400px;"></div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="销售员业绩" name="salesperson">
            <div class="chart-container">
              <div ref="salespersonChart" style="width: 100%; height: 400px;"></div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { mockApi } from '../mock/data'
import * as echarts from 'echarts'

// 搜索表单数据
const searchForm = reactive({
  dateRange: [],
  productName: '',
  customerName: '',
  salespersonName: ''
})

// 表格数据
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 统计数据
const statistics = reactive({
  totalAmount: '0.00',
  totalCost: '0.00',
  totalProfit: '0.00',
  avgProfitRate: '0.00'
})

// 数据分析相关
const analysisVisible = ref(false)
const activeTab = ref('trend')
const trendChart = ref(null)
const productChart = ref(null)
const salespersonChart = ref(null)

// 加载数据
const loadData = async () => {
  const res = await mockApi.getSalesDetails({
    page: currentPage.value,
    pageSize: pageSize.value,
    ...searchForm
  })
  
  tableData.value = res.data
  total.value = res.total
  
  // 计算统计数据
  if (res.data.length > 0) {
    const totalAmount = res.data.reduce((sum, item) => sum + parseFloat(item.amount), 0)
    const totalCost = res.data.reduce((sum, item) => sum + parseFloat(item.cost), 0)
    const totalProfit = res.data.reduce((sum, item) => sum + parseFloat(item.profit), 0)
    const avgProfitRate = (totalProfit / totalAmount * 100).toFixed(2)
    
    statistics.totalAmount = totalAmount.toFixed(2)
    statistics.totalCost = totalCost.toFixed(2)
    statistics.totalProfit = totalProfit.toFixed(2)
    statistics.avgProfitRate = avgProfitRate
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

// 重置搜索
const resetSearch = () => {
  searchForm.dateRange = []
  searchForm.productName = ''
  searchForm.customerName = ''
  searchForm.salespersonName = ''
  handleSearch()
}

// 导出明细
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 数据分析
const handleAnalysis = () => {
  analysisVisible.value = true
  setTimeout(() => {
    initCharts()
  }, 100)
}

// 初始化图表
const initCharts = () => {
  // 销售趋势图
  const trend = echarts.init(trendChart.value)
  trend.setOption({
    title: { text: '销售趋势分析' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: { type: 'value' },
    series: [{
      data: [150, 230, 224, 218, 135, 147],
      type: 'line'
    }]
  })

  // 商品销售分析
  const product = echarts.init(productChart.value)
  product.setOption({
    title: { text: '商品销售分析' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: '商品A' },
        { value: 735, name: '商品B' },
        { value: 580, name: '商品C' }
      ]
    }]
  })

  // 销售员业绩分析
  const salesperson = echarts.init(salespersonChart.value)
  salesperson.setOption({
    title: { text: '销售员业绩分析' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['张三', '李四', '王五'] },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: [5000, 4000, 3000]
    }]
  })
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  loadData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadData()
}

// 初始化加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.sales-detail {
  padding: 20px;
}

.operation-bar {
  margin-bottom: 20px;
}

.search-area {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.statistics-area {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistic-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  text-align: center;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.chart-container {
  padding: 20px;
}

:deep(.el-card__header) {
  padding: 10px 20px;
}

:deep(.el-card__body) {
  padding: 20px;
}
</style>`
