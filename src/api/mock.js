// 模拟后端API
export const mockApi = {
  // 获取出库单列表
  async getStockOutList({ page = 1, pageSize = 10, documentNo, type, dateRange }) {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟数据
    const mockData = Array(20).fill(null).map((_, index) => ({
      id: `${index + 1}`,
      documentNo: `SO${String(202500 + index).padStart(5, '0')}`,
      type: ['销售出库', '生产领料', '其他出库'][Math.floor(Math.random() * 3)],
      date: '2025-01-02',
      warehouse: `仓库${Math.floor(Math.random() * 3) + 1}`,
      customer: `客户${Math.floor(Math.random() * 5) + 1}`,
      totalAmount: Math.floor(Math.random() * 100000) / 100,
      status: Math.random() > 0.5 ? '已审核' : '未审核',
      creator: '管理员',
      createTime: '2025-01-02 10:00:00'
    }))

    // 模拟筛选
    let filteredData = [...mockData]
    if (documentNo) {
      filteredData = filteredData.filter(item => item.documentNo.includes(documentNo))
    }
    if (type) {
      filteredData = filteredData.filter(item => item.type === type)
    }
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.date)
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate)
      })
    }

    // 模拟分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = filteredData.slice(start, end)

    return {
      data: paginatedData,
      total: filteredData.length
    }
  },

  // 获取入库单列表
  async getStockInList({ page = 1, pageSize = 10, documentNo, type, dateRange }) {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟数据
    const mockData = Array(20).fill(null).map((_, index) => ({
      id: `${index + 1}`,
      documentNo: `SI${String(202500 + index).padStart(5, '0')}`,
      type: ['采购入库', '生产入库', '其他入库'][Math.floor(Math.random() * 3)],
      date: '2025-01-02',
      warehouse: `仓库${Math.floor(Math.random() * 3) + 1}`,
      supplier: `供应商${Math.floor(Math.random() * 5) + 1}`,
      totalAmount: Math.floor(Math.random() * 100000) / 100,
      status: Math.random() > 0.5 ? '已审核' : '未审核',
      creator: '管理员',
      createTime: '2025-01-02 10:00:00'
    }))

    // 模拟筛选
    let filteredData = [...mockData]
    if (documentNo) {
      filteredData = filteredData.filter(item => item.documentNo.includes(documentNo))
    }
    if (type) {
      filteredData = filteredData.filter(item => item.type === type)
    }
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.date)
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate)
      })
    }

    // 模拟分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = filteredData.slice(start, end)

    return {
      data: paginatedData,
      total: filteredData.length
    }
  },

  // 获取销售明细列表
  async getSalesDetailList({ page = 1, pageSize = 10, documentNo, dateRange }) {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟数据
    const mockData = Array(20).fill(null).map((_, index) => ({
      id: `${index + 1}`,
      documentNo: `SD${String(202500 + index).padStart(5, '0')}`,
      date: '2025-01-02',
      customer: `客户${Math.floor(Math.random() * 5) + 1}`,
      product: `商品${Math.floor(Math.random() * 10) + 1}`,
      quantity: Math.floor(Math.random() * 100) + 1,
      price: Math.floor(Math.random() * 1000) / 100,
      amount: Math.floor(Math.random() * 100000) / 100,
      creator: '管理员',
      createTime: '2025-01-02 10:00:00'
    }))

    // 模拟筛选
    let filteredData = [...mockData]
    if (documentNo) {
      filteredData = filteredData.filter(item => item.documentNo.includes(documentNo))
    }
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.date)
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate)
      })
    }

    // 模拟分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = filteredData.slice(start, end)

    return {
      data: paginatedData,
      total: filteredData.length
    }
  },

  // 获取收款单列表
  async getReceiptList({ page = 1, pageSize = 10, documentNo, dateRange }) {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟数据
    const mockData = Array(20).fill(null).map((_, index) => ({
      id: `${index + 1}`,
      documentNo: `RC${String(202500 + index).padStart(5, '0')}`,
      date: '2025-01-02',
      customer: `客户${Math.floor(Math.random() * 5) + 1}`,
      amount: Math.floor(Math.random() * 100000) / 100,
      paymentMethod: ['现金', '银行转账', '支票'][Math.floor(Math.random() * 3)],
      status: Math.random() > 0.5 ? '已审核' : '未审核',
      creator: '管理员',
      createTime: '2025-01-02 10:00:00'
    }))

    // 模拟筛选
    let filteredData = [...mockData]
    if (documentNo) {
      filteredData = filteredData.filter(item => item.documentNo.includes(documentNo))
    }
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.date)
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate)
      })
    }

    // 模拟分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = filteredData.slice(start, end)

    return {
      data: paginatedData,
      total: filteredData.length
    }
  },

  // 获取付款单列表
  async getPaymentList({ page = 1, pageSize = 10, documentNo, dateRange }) {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟数据
    const mockData = Array(20).fill(null).map((_, index) => ({
      id: `${index + 1}`,
      documentNo: `PM${String(202500 + index).padStart(5, '0')}`,
      date: '2025-01-02',
      supplier: `供应商${Math.floor(Math.random() * 5) + 1}`,
      amount: Math.floor(Math.random() * 100000) / 100,
      paymentMethod: ['现金', '银行转账', '支票'][Math.floor(Math.random() * 3)],
      status: Math.random() > 0.5 ? '已审核' : '未审核',
      creator: '管理员',
      createTime: '2025-01-02 10:00:00'
    }))

    // 模拟筛选
    let filteredData = [...mockData]
    if (documentNo) {
      filteredData = filteredData.filter(item => item.documentNo.includes(documentNo))
    }
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.date)
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate)
      })
    }

    // 模拟分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = filteredData.slice(start, end)

    return {
      data: paginatedData,
      total: filteredData.length
    }
  }
}
