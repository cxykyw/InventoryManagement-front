<template>
  <div class="receipt">
    <el-card class="box-card">
      <!-- 顶部操作栏 -->
      <div class="operation-bar">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增收款单
        </el-button>
        <el-button type="success" :disabled="!selectedRows.length" @click="handleAudit">
          <el-icon><Check /></el-icon>审核
        </el-button>
        <el-button type="danger" :disabled="!selectedRows.length" @click="handleDelete">
          <el-icon><Delete /></el-icon>删除
        </el-button>
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
          <el-form-item label="客户名称">
            <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态">
              <el-option label="全部" value="" />
              <el-option label="待审核" value="待审核" />
              <el-option label="已审核" value="已审核" />
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" width="50" label="序号" />
        <el-table-column prop="documentNo" label="单据编号" width="150" />
        <el-table-column prop="date" label="日期" width="120" sortable />
        <el-table-column prop="customer" label="客户" width="150" />
        <el-table-column prop="amount" label="收款金额" width="150" align="right">
          <template #default="scope">
            <span class="amount-cell positive">¥{{ scope.row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="收款方式" width="120" />
        <el-table-column prop="bankAccount" label="收款账号" width="180" />
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
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              @click="handleView(scope.row)"
            >
              <el-icon><View /></el-icon>查看
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
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增收款单' : '编辑收款单'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="receipt-form"
      >
        <el-form-item label="单据日期" prop="date">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="客户" prop="customer">
          <el-select
            v-model="form.customer"
            placeholder="请选择客户"
            style="width: 100%"
            filterable
          >
            <el-option label="客户A" value="客户A" />
            <el-option label="客户B" value="客户B" />
            <el-option label="客户C" value="客户C" />
          </el-select>
        </el-form-item>
        <el-form-item label="收款金额" prop="amount">
          <el-input
            v-model.number="form.amount"
            type="number"
            placeholder="请输入收款金额"
          >
            <template #prefix>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="收款方式" prop="paymentMethod">
          <el-select
            v-model="form.paymentMethod"
            placeholder="请选择收款方式"
            style="width: 100%"
          >
            <el-option label="现金" value="现金" />
            <el-option label="银行转账" value="银行转账" />
            <el-option label="支付宝" value="支付宝" />
            <el-option label="微信" value="微信" />
          </el-select>
        </el-form-item>
        <el-form-item label="收款账号" prop="bankAccount">
          <el-input
            v-model="form.bankAccount"
            placeholder="请输入收款账号"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Check, Delete, Search, Refresh, Edit, View } from '@element-plus/icons-vue'

// 表格选中行
const selectedRows = ref([])

// 搜索表单
const searchForm = reactive({
  dateRange: [],
  documentNo: '',
  customerName: '',
  status: ''
})

// 表格数据
const tableData = ref([
  {
    documentNo: 'RC20250102001',
    date: '2025-01-02',
    customer: '客户A',
    amount: 10000.00,
    paymentMethod: '银行转账',
    bankAccount: '6222021234567890123',
    status: '待审核',
    remark: '货款',
    creator: '张三',
    createTime: '2025-01-02 10:00:00'
  },
  {
    documentNo: 'RC20250102002',
    date: '2025-01-02',
    customer: '客户B',
    amount: 5000.00,
    paymentMethod: '支付宝',
    bankAccount: '13800138000',
    status: '已审核',
    remark: '预付款',
    creator: '李四',
    createTime: '2025-01-02 11:00:00'
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const loading = ref(false)

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const form = reactive({
  date: '',
  customer: '',
  amount: '',
  paymentMethod: '',
  bankAccount: '',
  remark: ''
})

// 表单校验规则
const rules = {
  date: [{ required: true, message: '请选择单据日期', trigger: 'change' }],
  customer: [{ required: true, message: '请选择客户', trigger: 'change' }],
  amount: [
    { required: true, message: '请输入收款金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
  ],
  paymentMethod: [{ required: true, message: '请选择收款方式', trigger: 'change' }],
  bankAccount: [{ required: true, message: '请输入收款账号', trigger: 'blur' }]
}

// 表格选择
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

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
  searchForm.documentNo = ''
  searchForm.customerName = ''
  searchForm.status = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  form.date = ''
  form.customer = ''
  form.amount = ''
  form.paymentMethod = ''
  form.bankAccount = ''
  form.remark = ''
}

// 编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, row)
}

// 查看
const handleView = (row) => {
  // TODO: 实现查看逻辑
  ElMessage.info('查看详情：' + row.documentNo)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      // TODO: 实现提交逻辑
      ElMessage.success(dialogType.value === 'add' ? '新增成功' : '修改成功')
      dialogVisible.value = false
      handleSearch()
    }
  })
}

// 审核
const handleAudit = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要审核的记录')
    return
  }
  ElMessageBox.confirm(
    `确认要审核选中的 ${selectedRows.value.length} 条记录吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // TODO: 实现审核逻辑
      ElMessage.success('审核成功')
      handleSearch()
    })
    .catch(() => {})
}

// 删除
const handleDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的记录')
    return
  }
  ElMessageBox.confirm(
    `确认要删除选中的 ${selectedRows.value.length} 条记录吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // TODO: 实现删除逻辑
      ElMessage.success('删除成功')
      handleSearch()
    })
    .catch(() => {})
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
.receipt {
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

  .operation-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
    align-items: center;

    .el-button {
      padding: 8px 16px;
      font-weight: 500;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 6px;

      .el-icon {
        margin-right: 4px;
      }

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      &.is-disabled {
        opacity: 0.7;
        cursor: not-allowed;
        &:hover {
          transform: none;
          box-shadow: none;
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

      .el-input__wrapper {
        box-shadow: 0 0 0 1px #dcdfe6 inset;
        transition: all 0.3s;

        &:hover {
          box-shadow: 0 0 0 1px #c0c4cc inset;
        }

        &.is-focus {
          box-shadow: 0 0 0 1px #409eff inset;
        }
      }
    }

    .el-button {
      padding: 8px 16px;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 6px;

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
      
      &.positive {
        color: #67c23a;
      }
      
      &.negative {
        color: #f56c6c;
      }
    }

    .el-button--link {
      font-weight: 500;
      padding: 4px 8px;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 4px;

      .el-icon {
        margin-right: 2px;
      }

      &:not(.is-disabled):hover {
        background-color: #f0f2f5;
        border-radius: 4px;
      }

      &.is-disabled {
        opacity: 0.6;
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
      font-weight: normal;

      .el-pagination__total {
        margin-right: 16px;
      }

      .el-pagination__sizes {
        margin-right: 16px;
      }

      button {
        transition: all 0.3s;

        &:hover {
          background-color: #f0f2f5;
        }
      }

      .el-pager li {
        transition: all 0.3s;

        &:hover {
          background-color: #f0f2f5;
        }

        &.is-active {
          background-color: #409eff;
          color: #fff;
        }
      }
    }
  }

  .receipt-form {
    .el-form-item {
      margin-bottom: 20px;
    }

    .el-input-number {
      width: 100%;
    }
  }

  .dialog-footer {
    .el-button {
      min-width: 100px;
      padding: 8px 20px;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
    }
  }
}
</style>
