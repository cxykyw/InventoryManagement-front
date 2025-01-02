<template>
  <div class="sales-detail">
    <el-card class="box-card">
      <!-- 统计区域 -->
      <div class="statistics-area">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>今日销售额</span>
                  <el-tag size="small" type="success">实时</el-tag>
                </div>
              </template>
              <div class="statistic-value">¥{{ todaySales.toFixed(2) }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>今日毛利</span>
                  <el-tag size="small" type="danger">实时</el-tag>
                </div>
              </template>
              <div class="statistic-value profit">¥{{ todayProfit.toFixed(2) }}</div>
              <div class="statistic-rate">
                毛利率：<span :class="{ 'positive': todayProfitRate >= 0 }">{{ todayProfitRate.toFixed(2) }}%</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>本月销售额</span>
                  <el-tag size="small" type="warning">月度</el-tag>
                </div>
              </template>
              <div class="statistic-value">¥{{ monthSales.toFixed(2) }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>本月毛利</span>
                  <el-tag size="small" type="warning">月度</el-tag>
                </div>
              </template>
              <div class="statistic-value profit">¥{{ monthProfit.toFixed(2) }}</div>
              <div class="statistic-rate">
                毛利率：<span :class="{ 'positive': monthProfitRate >= 0 }">{{ monthProfitRate.toFixed(2) }}%</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
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
          <el-form-item label="销售人员">
            <el-select v-model="searchForm.salesperson" placeholder="请选择销售人员" clearable>
              <el-option label="张三" value="张三" />
              <el-option label="李四" value="李四" />
              <el-option label="王五" value="王五" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>查询
            </el-button>
            <el-button @click="resetSearch">
              <el-icon><Refresh /></el-icon>重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <el-table
        :data="tableData"
        style="width: 100%"
        border
        stripe
        v-loading="loading"
      >
        <el-table-column type="index" width="50" label="序号" />
        <el-table-column prop="date" label="日期" width="120" sortable />
        <el-table-column prop="orderNo" label="订单编号" width="150" />
        <el-table-column prop="productName" label="商品名称" min-width="150" />
        <el-table-column prop="customerName" label="客户名称" width="150" />
        <el-table-column prop="salesperson" label="销售人员" width="120" />
        <el-table-column prop="quantity" label="数量" width="100" align="right" />
        <el-table-column prop="price" label="单价" width="120" align="right">
          <template #default="scope">
            <span class="amount-cell">¥{{ scope.row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="成本" width="120" align="right">
          <template #default="scope">
            <span class="amount-cell">¥{{ scope.row.cost.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="销售金额" width="120" align="right">
          <template #default="scope">
            <span class="amount-cell">¥{{ scope.row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="毛利" width="120" align="right">
          <template #default="scope">
            <span class="amount-cell" :class="{ 'positive': scope.row.profit >= 0, 'negative': scope.row.profit < 0 }">
              ¥{{ scope.row.profit.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="毛利率" width="100" align="right">
          <template #default="scope">
            <span class="rate-cell" :class="{ 'positive': scope.row.profitRate >= 0, 'negative': scope.row.profitRate < 0 }">
              {{ scope.row.profitRate.toFixed(2) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" />
      </el-table>

      <!-- 分页器 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'

// 统计数据
const todaySales = ref(12345.67)
const todayProfit = ref(4567.89)
const todayProfitRate = computed(() => (todayProfit.value / todaySales.value) * 100)

const monthSales = ref(345678.90)
const monthProfit = ref(98765.43)
const monthProfitRate = computed(() => (monthProfit.value / monthSales.value) * 100)

// 搜索表单
const searchForm = reactive({
  dateRange: [],
  productName: '',
  customerName: '',
  salesperson: ''
})

// 表格数据
const tableData = ref([
  {
    date: '2025-01-02',
    orderNo: 'SO20250102001',
    productName: '商品A',
    customerName: '客户1',
    salesperson: '张三',
    quantity: 10,
    price: 100.00,
    cost: 80.00,
    amount: 1000.00,
    profit: 200.00,
    profitRate: 20.00,
    remark: '备注信息'
  },
  {
    date: '2025-01-02',
    orderNo: 'SO20250102002',
    productName: '商品B',
    customerName: '客户2',
    salesperson: '李四',
    quantity: 5,
    price: 200.00,
    cost: 150.00,
    amount: 1000.00,
    profit: 250.00,
    profitRate: 25.00,
    remark: '备注信息'
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const loading = ref(false)

// 搜索处理
const handleSearch = () => {
  loading.value = true
  // TODO: 实现搜索逻辑
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

// 重置搜索
const resetSearch = () => {
  searchForm.dateRange = []
  searchForm.productName = ''
  searchForm.customerName = ''
  searchForm.salesperson = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  handleSearch()
}
</script>

<style>
.sales-detail {
  .box-card {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px 0 rgba(0,0,0,0.15);
    }
  }

  .statistics-area {
    margin-bottom: 20px;

    .el-card {
      border-radius: 8px;
      transition: all 0.3s;
      height: 100%;
      cursor: pointer;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid #f0f0f0;

        span {
          font-size: 14px;
          color: #606266;
        }
      }

      .statistic-value {
        padding: 16px 16px 8px;
        text-align: center;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        font-family: 'Roboto Mono', monospace;

        &.profit {
          color: #67c23a;
        }
      }

      .statistic-rate {
        padding: 0 16px 16px;
        text-align: center;
        font-size: 14px;
        color: #909399;

        span {
          font-weight: 500;
          
          &.positive {
            color: #67c23a;
          }
          
          &.negative {
            color: #f56c6c;
          }
        }
      }
    }
  }

  .search-area {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 6px;
    margin-bottom: 20px;
    transition: all 0.3s;

    &:hover {
      background-color: #f0f2f5;
    }

    .el-form-item {
      margin-bottom: 16px;
      margin-right: 20px;
    }

    .el-input,
    .el-select,
    .el-date-editor {
      width: 220px;
    }

    .el-button {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      transition: all 0.3s;

      .el-icon {
        margin-right: 4px;
      }

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
    }
  }

  .el-table {
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 20px;

    th {
      background-color: #f5f7fa;
      color: #606266;
      font-weight: 600;
      height: 48px;
    }

    .el-table__row {
      transition: all 0.3s;

      &:hover {
        background-color: #f5f7fa;
      }

      td {
        padding: 12px 0;
      }
    }

    .amount-cell {
      font-family: 'Roboto Mono', monospace;
      font-weight: 500;
      
      &.positive {
        color: #67c23a;
      }
      
      &.negative {
        color: #f56c6c;
      }
    }

    .rate-cell {
      font-family: 'Roboto Mono', monospace;
      font-weight: 500;
      
      &.positive {
        color: #67c23a;
      }
      
      &.negative {
        color: #f56c6c;
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: flex-end;
    padding: 16px 0;

    .el-pagination {
      padding: 0;
      margin: 0;
    }
  }
}
</style>
