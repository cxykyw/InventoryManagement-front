`<template>
  <div class="payment">
    <el-card class="box-card">
      <!-- 顶部操作栏 -->
      <div class="operation-bar">
        <el-button type="primary" @click="handleAdd">新增付款单</el-button>
        <el-button type="success" :disabled="!selectedRows.length" @click="handleAudit">审核</el-button>
        <el-button type="danger" :disabled="!selectedRows.length" @click="handleDelete">删除</el-button>
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
          <el-form-item label="单据编号">
            <el-input v-model="searchForm.documentNo" placeholder="请输入单据编号" />
          </el-form-item>
          <el-form-item label="供应商">
            <el-input v-model="searchForm.supplierName" placeholder="请输入供应商名称" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态">
              <el-option label="全部" value="" />
              <el-option label="待审核" value="待审核" />
              <el-option label="已审核" value="已审核" />
            </el-select>
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
        <el-table-column type="index" width="50" label="序号" />
        <el-table-column prop="documentNo" label="单据编号" width="150" />
        <el-table-column prop="date" label="日期" width="120" sortable />
        <el-table-column prop="supplier" label="供应商" width="150" />
        <el-table-column prop="amount" label="付款金额" width="150" align="right">
          <template #default="scope">
            ¥{{ scope.row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="付款方式" width="120" />
        <el-table-column prop="bankAccount" label="付款账号" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已审核' ? 'success' : ''">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" />
        <el-table-column prop="creator" label="制单人" width="120" />
        <el-table-column prop="createTime" label="制单时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button
              link
              type="primary"
              size="small"
              :disabled="scope.row.status === '已审核'"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              @click="handleView(scope.row)"
            >
              查看
            </el-button>
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
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="单据日期" prop="date">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="供应商" prop="supplier">
          <el-select
            v-model="form.supplier"
            placeholder="请选择供应商"
            style="width: 100%"
          >
            <el-option
              v-for="item in suppliers"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="付款金额" prop="amount">
          <el-input-number
            v-model="form.amount"
            :precision="2"
            :step="100"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="付款方式" prop="paymentMethod">
          <el-select
            v-model="form.paymentMethod"
            placeholder="请选择付款方式"
            style="width: 100%"
          >
            <el-option
              v-for="item in paymentMethods"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="付款账号" prop="bankAccount">
          <el-input
            v-model="form.bankAccount"
            placeholder="请输入付款账号"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mockApi, suppliers, paymentMethods } from '../mock/data'

// 搜索表单数据
const searchForm = reactive({
  dateRange: [],
  documentNo: '',
  supplierName: '',
  status: ''
})

// 表格数据
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedRows = ref([])

// 对话框数据
const dialogVisible = ref(false)
const dialogType = ref('add') // add or edit
const dialogTitle = computed(() => dialogType.value === 'add' ? '新增付款单' : '编辑付款单')

// 表单数据
const formRef = ref(null)
const form = reactive({
  date: '',
  supplier: '',
  amount: 0,
  paymentMethod: '',
  bankAccount: '',
  remark: ''
})

// 表单验证规则
const rules = {
  date: [{ required: true, message: '请选择单据日期', trigger: 'change' }],
  supplier: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  amount: [{ required: true, message: '请输入付款金额', trigger: 'blur' }],
  paymentMethod: [{ required: true, message: '请选择付款方式', trigger: 'change' }],
  bankAccount: [{ required: true, message: '请输入付款账号', trigger: 'blur' }]
}

// 加载数据
const loadData = async () => {
  const res = await mockApi.getPaymentList({
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
  searchForm.dateRange = []
  searchForm.documentNo = ''
  searchForm.supplierName = ''
  searchForm.status = ''
  handleSearch()
}

// 表格选择
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  form.date = new Date()
  form.supplier = ''
  form.amount = 0
  form.paymentMethod = ''
  form.bankAccount = ''
  form.remark = ''
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 查看
const handleView = (row) => {
  dialogType.value = 'view'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        await mockApi.addPayment(form)
        ElMessage.success('新增成功')
      } else {
        // 实际项目中这里应该调用更新接口
        ElMessage.success('更新成功')
      }
      dialogVisible.value = false
      loadData()
    }
  })
}

// 审核
const handleAudit = async () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请选择要审核的单据')
    return
  }
  
  const hasAudited = selectedRows.value.some(row => row.status === '已审核')
  if (hasAudited) {
    ElMessage.warning('选中的单据中包含已审核的单据')
    return
  }
  
  try {
    await ElMessageBox.confirm('确认要审核选中的单据吗？')
    for (const row of selectedRows.value) {
      await mockApi.auditFinanceDocument(row.id, 'payment')
    }
    ElMessage.success('审核成功')
    loadData()
  } catch (error) {
    // 用户取消操作
  }
}

// 删除
const handleDelete = async () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请选择要删除的单据')
    return
  }
  
  const hasAudited = selectedRows.value.some(row => row.status === '已审核')
  if (hasAudited) {
    ElMessage.warning('选中的单据中包含已审核的单据')
    return
  }
  
  try {
    await ElMessageBox.confirm('确认要删除选中的单据吗？')
    for (const row of selectedRows.value) {
      await mockApi.deleteFinanceDocument(row.id, 'payment')
    }
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    // 用户取消操作
  }
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
.payment {
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

.pagination {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  width: 100%;
  text-align: right;
}
</style>`
