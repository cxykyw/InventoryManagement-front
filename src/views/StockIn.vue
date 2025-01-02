<template>
  <div class="stock-in">
    <el-card class="box-card">
      <!-- 顶部操作栏 -->
      <div class="operation-bar">
        <el-button type="primary" @click="handleAdd">新增入库单</el-button>
        <el-button type="success" @click="handleAudit" :disabled="!selectedRows.length">审核</el-button>
        <el-button @click="handleExport" :disabled="!tableData.length">导出</el-button>
      </div>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="单据编号">
            <el-input v-model="searchForm.documentNo" placeholder="请输入单据编号" />
          </el-form-item>
          <el-form-item label="入库类型">
            <el-select v-model="searchForm.type" placeholder="请选择入库类型">
              <el-option label="采购入库" value="purchase" />
              <el-option label="生产入库" value="production" />
              <el-option label="其他入库" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <el-table
        :data="tableData"
        style="width: 100%"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="documentNo" label="单据编号" width="180" />
        <el-table-column prop="type" label="入库类型" width="120" />
        <el-table-column prop="date" label="入库日期" width="180" />
        <el-table-column prop="warehouse" label="仓库" width="120" />
        <el-table-column prop="supplier" label="供应商" width="120" />
        <el-table-column prop="totalAmount" label="入库金额" width="120">
          <template #default="scope">
            ¥{{ scope.row.totalAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已审核' ? 'success' : 'warning'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="scope">
            <el-button
              size="small"
              @click="handleEdit(scope.row)"
              :disabled="scope.row.status === '已审核'"
            >编辑</el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
              :disabled="scope.row.status === '已审核'"
            >删除</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="60%"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="入库类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择入库类型">
            <el-option label="采购入库" value="采购入库" />
            <el-option label="生产入库" value="生产入库" />
            <el-option label="其他入库" value="其他入库" />
          </el-select>
        </el-form-item>
        <el-form-item label="入库日期" prop="date">
          <el-date-picker
            v-model="formData.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="仓库" prop="warehouse">
          <el-select v-model="formData.warehouse" placeholder="请选择仓库">
            <el-option
              v-for="item in warehouses"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="供应商" prop="supplier">
          <el-select v-model="formData.supplier" placeholder="请选择供应商">
            <el-option
              v-for="item in suppliers"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        
        <!-- 明细表格 -->
        <el-form-item label="入库明细">
          <el-table :data="formData.items" border style="width: 100%">
            <el-table-column type="index" width="50" label="序号" />
            <el-table-column label="商品" prop="productName">
              <template #default="scope">
                <el-select 
                  v-model="scope.row.productId"
                  @change="handleProductChange($event, scope.$index)"
                  placeholder="选择商品"
                >
                  <el-option
                    v-for="item in products"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="150">
              <template #default="scope">
                <el-input-number 
                  v-model="scope.row.quantity"
                  :min="1"
                  @change="calculateRowAmount(scope.$index)"
                />
              </template>
            </el-table-column>
            <el-table-column label="单价" width="150">
              <template #default="scope">
                <el-input-number 
                  v-model="scope.row.price"
                  :min="0"
                  :precision="2"
                  @change="calculateRowAmount(scope.$index)"
                />
              </template>
            </el-table-column>
            <el-table-column label="金额" width="150">
              <template #default="scope">
                {{ scope.row.amount?.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button
                  type="danger"
                  size="small"
                  @click="removeDetail(scope.$index)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="detail-operations">
            <el-button type="primary" @click="addDetail">添加明细</el-button>
            <div class="total-amount">
              总金额：¥{{ totalAmount }}
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mockApi } from '@/api/mock'

// 搜索表单数据
const searchForm = reactive({
  documentNo: '',
  type: '',
  dateRange: []
})

// 表格数据
const tableData = ref([])
const selectedRows = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 表单数据
const dialogVisible = ref(false)
const dialogTitle = ref('新增入库单')
const formRef = ref(null)
const formData = reactive({
  type: '',
  date: '',
  warehouse: '',
  supplier: '',
  items: []
})

// 表单验证规则
const formRules = {
  type: [{ required: true, message: '请选择入库类型', trigger: 'change' }],
  date: [{ required: true, message: '请选择入库日期', trigger: 'change' }],
  warehouse: [{ required: true, message: '请选择仓库', trigger: 'change' }],
  supplier: [{ required: true, message: '请选择供应商', trigger: 'change' }]
}

// 计算总金额
const totalAmount = computed(() => {
  return formData.items.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2)
})

// 加载数据
const loadData = async () => {
  const res = await mockApi.getStockInList({
    page: currentPage.value,
    pageSize: pageSize.value,
    ...searchForm
  })
  tableData.value = res.data
  total.value = res.total
}

// 搜索
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

// 选择行变化
const handleSelectionChange = (val) => {
  selectedRows.value = val
}

// 新增入库单
const handleAdd = () => {
  dialogTitle.value = '新增入库单'
  formData.type = ''
  formData.date = ''
  formData.warehouse = ''
  formData.supplier = ''
  formData.items = []
  dialogVisible.value = true
}

// 编辑入库单
const handleEdit = (row) => {
  dialogTitle.value = '编辑入库单'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 删除入库单
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该入库单吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    await mockApi.deleteDocument(row.id, 'in')
    ElMessage.success('删除成功')
    loadData()
  })
}

// 审核
const handleAudit = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要审核的单据')
    return
  }
  
  ElMessageBox.confirm('确定要审核选中的单据吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    for (const row of selectedRows.value) {
      await mockApi.auditDocument(row.id, 'in')
    }
    ElMessage.success('审核成功')
    loadData()
  })
}

// 导出
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 添加明细行
const addDetail = () => {
  formData.items.push({
    productId: '',
    productName: '',
    quantity: 1,
    price: 0,
    amount: 0
  })
}

// 删除明细行
const removeDetail = (index) => {
  formData.items.splice(index, 1)
}

// 选择商品
const handleProductChange = (productId, index) => {
  const product = products.find(p => p.id === productId)
  if (product) {
    formData.items[index].productName = product.name
    formData.items[index].price = product.price
    calculateRowAmount(index)
  }
}

// 计算行金额
const calculateRowAmount = (index) => {
  const item = formData.items[index]
  item.amount = item.quantity * item.price
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (formData.items.length === 0) {
        ElMessage.warning('请添加入库明细')
        return
      }
      
      const data = {
        ...formData,
        totalAmount: totalAmount.value
      }
      
      await mockApi.addStockIn(data)
      ElMessage.success(dialogTitle.value === '新增入库单' ? '新增成功' : '编辑成功')
      dialogVisible.value = false
      loadData()
    }
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
loadData()
</script>

<style scoped>
.stock-in {
  padding: 20px;
}

.stock-in .box-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.stock-in .operation-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.stock-in .operation-bar .el-button {
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s;
}

.stock-in .operation-bar .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stock-in .search-area {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.stock-in .search-area .el-form-item {
  margin-bottom: 16px;
  margin-right: 20px;
}

.stock-in .search-area .el-input,
.stock-in .search-area .el-select,
.stock-in .search-area .el-date-editor {
  width: 220px;
}

.stock-in .el-table {
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 20px;
}

.stock-in .el-table .el-table__header-wrapper th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.stock-in .el-table .el-table__row {
  transition: all 0.3s;
}

.stock-in .el-table .el-table__row:hover {
  background-color: #f5f7fa;
}

.stock-in .el-table .el-tag {
  border-radius: 4px;
  padding: 4px 8px;
}

.stock-in .el-table .el-button {
  padding: 6px 12px;
  min-height: 32px;
}

.stock-in .pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}

.stock-in .el-dialog {
  border-radius: 8px;
}

.stock-in .el-dialog .el-dialog__header {
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid #f0f0f0;
}

.stock-in .el-dialog .el-dialog__header .el-dialog__title {
  font-size: 18px;
  font-weight: 600;
}

.stock-in .el-dialog .el-dialog__body {
  padding: 24px;
}

.stock-in .el-dialog .el-dialog__footer {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
}

.stock-in .el-dialog .detail-table {
  margin-top: 20px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
}

.stock-in .el-dialog .detail-table .detail-header {
  background-color: #f5f7fa;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stock-in .el-dialog .detail-table .detail-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.stock-in .el-dialog .detail-table .detail-content {
  padding: 16px;
}

.stock-in .el-dialog .detail-operations {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stock-in .el-dialog .total-amount {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
}
</style>
