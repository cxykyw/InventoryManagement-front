<template>
  <div class="stock-out">
    <el-card class="box-card" shadow="hover">
      <!-- 顶部操作栏 -->
      <div class="operation-bar">
        <el-button-group>
          <el-button type="primary" @click="handleAdd" :icon="Plus">新增出库单</el-button>
          <el-button type="success" @click="handleAudit" :disabled="!selectedRows.length" :icon="Check">审核</el-button>
          <el-button @click="handleExport" :disabled="!tableData.length" :icon="Download">导出</el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="!selectedRows.length" :icon="Delete">批量删除</el-button>
        </el-button-group>
        
        <el-tooltip content="刷新数据" placement="top">
          <el-button :icon="Refresh" circle @click="loadData" />
        </el-tooltip>
      </div>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="单据编号">
            <el-input v-model="searchForm.documentNo" placeholder="请输入单据编号" clearable />
          </el-form-item>
          <el-form-item label="出库类型">
            <el-select v-model="searchForm.type" placeholder="请选择出库类型" clearable>
              <el-option label="销售出库" value="sales">
                <el-icon><Sell /></el-icon>
                <span style="margin-left: 8px">销售出库</span>
              </el-option>
              <el-option label="生产领料" value="production">
                <el-icon><Box /></el-icon>
                <span style="margin-left: 8px">生产领料</span>
              </el-option>
              <el-option label="其他出库" value="other">
                <el-icon><More /></el-icon>
                <span style="margin-left: 8px">其他出库</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :shortcuts="dateShortcuts"
              value-format="YYYY-MM-DD"
              :disabled-date="disabledDate"
            />
          </el-form-item>
          <el-form-item>
            <el-button-group>
              <el-button type="primary" @click="handleSearch" :icon="Search">查询</el-button>
              <el-button @click="resetSearch" :icon="Refresh">重置</el-button>
            </el-button-group>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        border
        stripe
        @selection-change="handleSelectionChange"
        highlight-current-row
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="documentNo" label="单据编号" width="180" show-overflow-tooltip>
          <template #default="scope">
            <el-link type="primary" @click="handleView(scope.row)">{{ scope.row.documentNo }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="出库类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)" effect="dark">
              <el-icon class="type-icon">
                <component :is="getTypeIcon(scope.row.type)" />
              </el-icon>
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="出库日期" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="warehouse" label="仓库" width="120" show-overflow-tooltip />
        <el-table-column prop="customer" label="客户" width="120" show-overflow-tooltip />
        <el-table-column prop="totalAmount" label="出库金额" width="120">
          <template #default="scope">
            <span class="amount" :class="{ 'high-amount': scope.row.totalAmount > 10000 }">
              ¥{{ formatNumber(scope.row.totalAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag 
              :type="scope.row.status === '已审核' ? 'success' : 'warning'" 
              effect="dark"
              size="small"
            >
              <el-icon>
                <component :is="scope.row.status === '已审核' ? 'Check' : 'Warning'" />
              </el-icon>
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="120" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="scope">
            <el-button-group>
              <el-tooltip content="查看详情" placement="top">
                <el-button
                  size="small"
                  :icon="View"
                  @click="handleView(scope.row)"
                />
              </el-tooltip>
              <el-tooltip content="编辑" placement="top">
                <el-button
                  size="small"
                  type="primary"
                  :icon="Edit"
                  @click="handleEdit(scope.row)"
                  :disabled="scope.row.status === '已审核'"
                />
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button
                  size="small"
                  type="danger"
                  :icon="Delete"
                  @click="handleDelete(scope.row)"
                  :disabled="scope.row.status === '已审核'"
                />
              </el-tooltip>
              <el-tooltip content="打印" placement="top">
                <el-button
                  size="small"
                  :icon="Printer"
                  @click="handlePrint(scope.row)"
                />
              </el-tooltip>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-container">
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="80%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="dialog-form"
      >
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="出库类型" prop="type">
              <el-select v-model="formData.type" placeholder="请选择出库类型" class="full-width">
                <el-option label="销售出库" value="销售出库">
                  <el-icon><Sell /></el-icon>
                  <span style="margin-left: 8px">销售出库</span>
                </el-option>
                <el-option label="生产领料" value="生产领料">
                  <el-icon><Box /></el-icon>
                  <span style="margin-left: 8px">生产领料</span>
                </el-option>
                <el-option label="其他出库" value="其他出库">
                  <el-icon><More /></el-icon>
                  <span style="margin-left: 8px">其他出库</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="出库日期" prop="date">
              <el-date-picker
                v-model="formData.date"
                type="date"
                placeholder="选择日期"
                class="full-width"
                :disabled-date="disabledDate"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="仓库" prop="warehouse">
              <el-select 
                v-model="formData.warehouse" 
                placeholder="请选择仓库"
                filterable
                class="full-width"
              >
                <el-option
                  v-for="item in warehouses"
                  :key="item.id"
                  :label="item.name"
                  :value="item.name"
                >
                  <span>{{ item.name }}</span>
                  <span class="option-stock">库存: {{ item.stock }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="客户" prop="customer">
              <el-select 
                v-model="formData.customer" 
                placeholder="请选择客户"
                filterable
                remote
                :remote-method="remoteSearchCustomer"
                class="full-width"
              >
                <el-option
                  v-for="item in customers"
                  :key="item.id"
                  :label="item.name"
                  :value="item.name"
                >
                  <div class="customer-option">
                    <span>{{ item.name }}</span>
                    <small>{{ item.contact }}</small>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="备注">
              <el-input 
                v-model="formData.remark" 
                type="textarea" 
                :rows="1"
                placeholder="请输入备注信息"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 明细表格 -->
        <el-form-item label="出库明细">
          <div class="detail-table-wrapper">
            <el-table 
              :data="formData.items" 
              border 
              style="width: 100%"
              :max-height="400"
              highlight-current-row
            >
              <el-table-column type="index" width="50" label="序号" />
              <el-table-column label="商品" prop="productName" min-width="200">
                <template #default="scope">
                  <el-select 
                    v-model="scope.row.productId"
                    @change="handleProductChange($event, scope.$index)"
                    placeholder="选择商品"
                    filterable
                    class="full-width"
                  >
                    <el-option
                      v-for="item in products"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    >
                      <div class="product-option">
                        <span>{{ item.name }}</span>
                        <div class="product-info">
                          <small>库存: {{ item.stock }}</small>
                          <small>单价: ¥{{ item.price }}</small>
                        </div>
                      </div>
                    </el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="数量" width="180">
                <template #default="scope">
                  <el-input-number 
                    v-model="scope.row.quantity"
                    :min="1"
                    :max="getMaxQuantity(scope.row)"
                    @change="calculateRowAmount(scope.$index)"
                    class="full-width"
                  />
                </template>
              </el-table-column>
              <el-table-column label="单价" width="180">
                <template #default="scope">
                  <el-input-number 
                    v-model="scope.row.price"
                    :min="0"
                    :precision="2"
                    @change="calculateRowAmount(scope.$index)"
                    class="full-width"
                  />
                </template>
              </el-table-column>
              <el-table-column label="金额" width="180">
                <template #default="scope">
                  <span class="amount">¥{{ formatNumber(scope.row.amount || 0) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="库存" width="120">
                <template #default="scope">
                  <el-tag :type="getStockTagType(scope.row)">
                    {{ getProductStock(scope.row.productId) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="scope">
                  <el-button
                    type="danger"
                    size="small"
                    :icon="Delete"
                    circle
                    @click="removeDetail(scope.$index)"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="detail-operations">
            <el-button type="primary" @click="addDetail" :icon="Plus">添加明细</el-button>
            <div class="summary-info">
              <span class="summary-item">
                <label>总数量：</label>
                <span class="value">{{ totalQuantity }}</span>
              </span>
              <span class="summary-item">
                <label>总金额：</label>
                <span class="amount">¥{{ formatNumber(totalAmount) }}</span>
              </span>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      title="出库单详情"
      v-model="viewDialogVisible"
      width="80%"
      :close-on-click-modal="true"
      destroy-on-close
    >
      <div class="detail-view">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="单据编号">{{ viewData.documentNo }}</el-descriptions-item>
          <el-descriptions-item label="出库类型">
            <el-tag :type="getTypeTagType(viewData.type)" effect="dark">{{ viewData.type }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="出库日期">{{ formatDate(viewData.date) }}</el-descriptions-item>
          <el-descriptions-item label="仓库">{{ viewData.warehouse }}</el-descriptions-item>
          <el-descriptions-item label="客户">{{ viewData.customer }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="viewData.status === '已审核' ? 'success' : 'warning'" effect="dark">
              {{ viewData.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建人">{{ viewData.creator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(viewData.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ viewData.remark || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-items">
          <h3>出库明细</h3>
          <el-table :data="viewData.items" border stripe>
            <el-table-column type="index" label="序号" width="50" />
            <el-table-column prop="productName" label="商品" min-width="200" />
            <el-table-column prop="quantity" label="数量" width="120" />
            <el-table-column prop="price" label="单价" width="120">
              <template #default="scope">
                ¥{{ formatNumber(scope.row.price) }}
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="120">
              <template #default="scope">
                <span class="amount">¥{{ formatNumber(scope.row.amount) }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="detail-summary">
            <span class="summary-item">
              <label>总数量：</label>
              <span class="value">{{ calculateTotalQuantity(viewData.items) }}</span>
            </span>
            <span class="summary-item">
              <label>总金额：</label>
              <span class="amount">¥{{ formatNumber(calculateTotalAmount(viewData.items)) }}</span>
            </span>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handlePrint(viewData)">打印</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mockApi } from '@/api/mock'
import { 
  Plus,
  Edit,
  Delete,
  Search,
  Refresh,
  Download,
  Check,
  View,
  Printer,
  Sell,
  More,
  Warning,
  Box,
  Document,
  CircleCheck
} from '@element-plus/icons-vue'
import { format } from 'date-fns'

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const selectedRows = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const submitting = ref(false)
const viewDialogVisible = ref(false)
const viewData = reactive({
  documentNo: '',
  type: '',
  date: '',
  warehouse: '',
  customer: '',
  status: '',
  creator: '',
  createTime: '',
  remark: '',
  items: []
})

// 搜索表单
const searchForm = reactive({
  documentNo: '',
  type: '',
  dateRange: []
})

// 表单数据
const formData = reactive({
  type: '',
  date: '',
  warehouse: '',
  customer: '',
  items: []
})

// 表单验证规则
const formRules = {
  type: [{ required: true, message: '请选择出库类型', trigger: 'change' }],
  date: [{ required: true, message: '请选择出库日期', trigger: 'change' }],
  warehouse: [{ required: true, message: '请选择仓库', trigger: 'change' }],
  customer: [{ required: true, message: '请选择客户', trigger: 'change' }]
}

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
]

// 禁用日期
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}

// 格式化函数
const formatDate = (date) => {
  if (!date) return '-'
  return format(new Date(date), 'yyyy-MM-dd')
}

const formatDateTime = (datetime) => {
  if (!datetime) return '-'
  return format(new Date(datetime), 'yyyy-MM-dd HH:mm:ss')
}

const formatNumber = (num) => {
  if (!num && num !== 0) return '0.00'
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

// 获取出库类型标签样式
const getTypeTagType = (type) => {
  const map = {
    '销售出库': 'success',
    '生产领料': 'warning',
    '其他出库': 'info'
  }
  return map[type] || 'info'
}

// 获取出库类型图标
const getTypeIcon = (type) => {
  const map = {
    '销售出库': 'Sell',
    '生产领料': 'Box',
    '其他出库': 'More'
  }
  return map[type] || 'Document'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await mockApi.getStockOutList({
      page: currentPage.value,
      pageSize: pageSize.value,
      documentNo: searchForm.documentNo,
      type: searchForm.type === 'sales' ? '销售出库' : 
            searchForm.type === 'production' ? '生产领料' : 
            searchForm.type === 'other' ? '其他出库' : '',
      dateRange: searchForm.dateRange
    })
    tableData.value = res.data
    total.value = res.total
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

// 重置搜索
const resetSearch = () => {
  searchForm.documentNo = ''
  searchForm.type = ''
  searchForm.dateRange = []
  handleSearch()
}

// 处理选择变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 处理新增
const handleAdd = () => {
  dialogTitle.value = '新增出库单'
  dialogVisible.value = true
  formData.type = ''
  formData.date = ''
  formData.warehouse = ''
  formData.customer = ''
  formData.items = []
}

// 处理编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑出库单'
  dialogVisible.value = true
  Object.assign(formData, row)
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该出库单？', '提示', {
    type: 'warning'
  }).then(async () => {
    loading.value = true
    try {
      await mockApi.deleteDocument(row.id, 'out')
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error('删除失败')
      console.error(error)
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 处理审核
const handleAudit = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请选择要审核的记录')
    return
  }
  ElMessageBox.confirm(`确认审核选中的 ${selectedRows.value.length} 条记录？`, '提示', {
    type: 'warning'
  }).then(async () => {
    loading.value = true
    try {
      await Promise.all(selectedRows.value.map(row => mockApi.auditDocument(row.id, 'out')))
      ElMessage.success('审核成功')
      loadData()
    } catch (error) {
      ElMessage.error('审核失败')
      console.error(error)
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // 用户取消审核
  })
}

// 处理导出
const handleExport = () => {
  ElMessage.success('导出功能开发中')
}

// 处理查看
const handleView = (row) => {
  Object.assign(viewData, row)
  viewDialogVisible.value = true
}

// 处理打印
const handlePrint = (row) => {
  ElMessage.success('打印功能开发中')
}

// 处理批量删除
const handleBatchDelete = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请选择要删除的记录')
    return
  }
  ElMessageBox.confirm(`确认删除选中的 ${selectedRows.value.length} 条记录？`, '提示', {
    type: 'warning'
  }).then(async () => {
    loading.value = true
    try {
      await Promise.all(selectedRows.value.map(row => mockApi.deleteDocument(row.id, 'out')))
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error('删除失败')
      console.error(error)
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 添加明细
const addDetail = () => {
  formData.items.push({
    productId: '',
    productName: '',
    quantity: 1,
    price: 0,
    amount: 0
  })
}

// 移除明细
const removeDetail = (index) => {
  formData.items.splice(index, 1)
}

// 计算行金额
const calculateRowAmount = (index) => {
  const item = formData.items[index]
  item.amount = item.quantity * item.price
}

// 计算总数量
const calculateTotalQuantity = (items) => {
  return items.reduce((sum, item) => sum + (item.quantity || 0), 0)
}

// 计算总金额
const calculateTotalAmount = (items) => {
  return items.reduce((sum, item) => sum + (item.amount || 0), 0)
}

// 总数量
const totalQuantity = computed(() => {
  return formData.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
})

// 总金额
const totalAmount = computed(() => {
  return formData.items.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2)
})

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    submitting.value = true
    // TODO: 实现保存逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('表单校验失败', error)
  } finally {
    submitting.value = false
  }
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  loadData()
}

// 处理每页条数变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  loadData()
}

// 获取商品库存
const getProductStock = (productId) => {
  if (!productId) return 0
  const product = products.find(p => p.id === productId)
  return product ? product.stock : 0
}

// 获取库存标签类型
const getStockTagType = (row) => {
  if (!row.productId) return 'info'
  const stock = getProductStock(row.productId)
  if (stock <= 0) return 'danger'
  if (stock < 10) return 'warning'
  return 'success'
}

// 获取最大可出库数量
const getMaxQuantity = (row) => {
  if (!row.productId) return 999999
  return getProductStock(row.productId)
}

// 商品数据
const products = [
  { id: '1', name: '商品1', stock: 100, price: 10.00 },
  { id: '2', name: '商品2', stock: 50, price: 20.00 },
  { id: '3', name: '商品3', stock: 30, price: 30.00 },
  { id: '4', name: '商品4', stock: 20, price: 40.00 },
  { id: '5', name: '商品5', stock: 10, price: 50.00 },
  { id: '6', name: '商品6', stock: 5, price: 60.00 },
  { id: '7', name: '商品7', stock: 0, price: 70.00 }
]

// 初始化加载数据
loadData()
</script>

<style scoped>
.stock-out {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.operation-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-area {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.amount {
  color: #67c23a;
  font-weight: bold;
}

.high-amount {
  color: #f56c6c;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

:deep(.el-pagination) {
  justify-content: flex-end;
  margin-right: 20px;
}

.dialog-form {
  padding: 20px;
}

.detail-table-wrapper {
  margin-bottom: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.detail-operations {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-info {
  display: flex;
  gap: 20px;
}

.summary-item {
  font-size: 14px;
}

.summary-item label {
  color: #606266;
}

.summary-item .value {
  font-weight: bold;
  color: #409eff;
}

.full-width {
  width: 100%;
}

.product-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-info {
  display: flex;
  gap: 10px;
  color: #909399;
}

.customer-option {
  display: flex;
  flex-direction: column;
}

.customer-option small {
  color: #909399;
}

.option-stock {
  float: right;
  color: #909399;
}

.type-icon {
  margin-right: 4px;
}

.detail-view {
  padding: 20px;
}

.detail-items {
  margin-top: 20px;
}

.detail-items h3 {
  margin-bottom: 16px;
  color: #303133;
}

.detail-summary {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 20px;
}

:deep(.el-descriptions) {
  margin-bottom: 20px;
}

:deep(.el-table) {
  margin-top: 20px;
}

:deep(.el-table th) {
  background-color: #f5f7fa !important;
}

:deep(.el-button-group) {
  display: flex;
  gap: 5px;
}

:deep(.el-tag) {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
