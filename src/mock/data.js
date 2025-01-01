// 生成随机数据的辅助函数
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateAmount = () => (Math.random() * 10000).toFixed(2);

// 模拟仓库数据
export const warehouses = [
  { id: 1, name: '主仓库' },
  { id: 2, name: '次仓库' },
  { id: 3, name: '临时仓库' }
];

// 模拟供应商数据
export const suppliers = [
  { id: 1, name: '供应商A' },
  { id: 2, name: '供应商B' },
  { id: 3, name: '供应商C' }
];

// 模拟客户数据
export const customers = [
  { id: 1, name: '客户A' },
  { id: 2, name: '客户B' },
  { id: 3, name: '客户C' }
];

// 模拟销售员数据
export const salespeople = [
  { id: 1, name: '张三', department: '销售一部' },
  { id: 2, name: '李四', department: '销售二部' },
  { id: 3, name: '王五', department: '销售一部' }
];

// 模拟商品数据（添加成本价）
export const products = [
  { id: 1, name: '商品A', unit: '个', price: 100, cost: 70 },
  { id: 2, name: '商品B', unit: '箱', price: 200, cost: 150 },
  { id: 3, name: '商品C', unit: '件', price: 150, cost: 100 }
];

// 模拟入库单据数据
export const stockInList = [
  {
    id: generateId(),
    documentNo: 'RK202501010001',
    type: '采购入库',
    date: '2025-01-01',
    warehouse: '主仓库',
    supplier: '供应商A',
    totalAmount: generateAmount(),
    status: '已审核',
    creator: '张三',
    createTime: '2025-01-01 10:00:00',
    items: [
      { productId: 1, productName: '商品A', quantity: 100, price: 70, amount: 7000 }
    ]
  }
];

// 模拟出库单据数据（添加销售员信息）
export const stockOutList = [
  {
    id: generateId(),
    documentNo: 'CK202501010001',
    type: '销售出库',
    date: '2025-01-01',
    warehouse: '主仓库',
    customer: '客户A',
    salesperson: '张三',
    totalAmount: generateAmount(),
    status: '已审核',
    creator: '李四',
    createTime: '2025-01-01 11:00:00',
    items: [
      { productId: 1, productName: '商品A', quantity: 50, price: 100, amount: 5000, cost: 70 }
    ]
  }
];

// 模拟收款单数据
export const receiptList = [
  {
    id: generateId(),
    documentNo: 'SK202501010001',
    date: '2025-01-01',
    customer: '客户A',
    amount: 10000.00,
    paymentMethod: '银行转账',
    bankAccount: '622848******1234',
    status: '已审核',
    remark: '销售货款',
    creator: '张三',
    createTime: '2025-01-01 10:00:00',
    relatedDocuments: ['CK202501010001'] // 关联的出库单号
  }
];

// 模拟付款单数据
export const paymentList = [
  {
    id: generateId(),
    documentNo: 'FK202501010001',
    date: '2025-01-01',
    supplier: '供应商A',
    amount: 7000.00,
    paymentMethod: '银行转账',
    bankAccount: '622848******5678',
    status: '已审核',
    remark: '采购货款',
    creator: '李四',
    createTime: '2025-01-01 11:00:00',
    relatedDocuments: ['RK202501010001'] // 关联的入库单号
  }
];

// 支付方式选项
export const paymentMethods = [
  { value: '现金', label: '现金' },
  { value: '银行转账', label: '银行转账' },
  { value: '支付宝', label: '支付宝' },
  { value: '微信', label: '微信' },
  { value: '其他', label: '其他' }
];

// 生成模拟销售明细数据
const generateSalesDetails = () => {
  const details = [];
  const startDate = new Date('2025-01-01');
  
  for (let i = 0; i < 50; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const salesperson = salespeople[Math.floor(Math.random() * salespeople.length)];
    const quantity = Math.floor(Math.random() * 100) + 1;
    const price = product.price * (0.9 + Math.random() * 0.2); // 随机波动的售价
    const amount = quantity * price;
    const cost = product.cost * quantity;
    const profit = amount - cost;
    
    details.push({
      id: generateId(),
      date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      documentNo: `CK2025010100${(i + 1).toString().padStart(2, '0')}`,
      productId: product.id,
      productName: product.name,
      customerId: customer.id,
      customerName: customer.name,
      salespersonId: salesperson.id,
      salespersonName: salesperson.name,
      department: salesperson.department,
      quantity,
      price: price.toFixed(2),
      amount: amount.toFixed(2),
      cost: cost.toFixed(2),
      profit: profit.toFixed(2),
      profitRate: ((profit / amount) * 100).toFixed(2)
    });
  }
  
  return details;
};

// 模拟API函数
export const mockApi = {
  // 获取入库单列表
  getStockInList(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          total: stockInList.length,
          data: stockInList
        });
      }, 300);
    });
  },

  // 获取出库单列表
  getStockOutList(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          total: stockOutList.length,
          data: stockOutList
        });
      }, 300);
    });
  },

  // 获取销售明细列表
  getSalesDetails(params) {
    const details = generateSalesDetails();
    return new Promise((resolve) => {
      setTimeout(() => {
        // 处理搜索条件
        let filteredData = [...details];
        if (params) {
          const { dateRange, productName, customerName, salespersonName } = params;
          
          if (dateRange && dateRange.length === 2) {
            filteredData = filteredData.filter(item => 
              item.date >= dateRange[0] && item.date <= dateRange[1]
            );
          }
          
          if (productName) {
            filteredData = filteredData.filter(item => 
              item.productName.includes(productName)
            );
          }
          
          if (customerName) {
            filteredData = filteredData.filter(item => 
              item.customerName.includes(customerName)
            );
          }
          
          if (salespersonName) {
            filteredData = filteredData.filter(item => 
              item.salespersonName.includes(salespersonName)
            );
          }
        }
        
        resolve({
          total: filteredData.length,
          data: filteredData
        });
      }, 300);
    });
  },

  // 获取收款单列表
  getReceiptList(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredData = [...receiptList];
        
        // 处理搜索条件
        if (params) {
          const { dateRange, customerName, documentNo, status } = params;
          
          if (dateRange && dateRange.length === 2) {
            filteredData = filteredData.filter(item => 
              item.date >= dateRange[0] && item.date <= dateRange[1]
            );
          }
          
          if (customerName) {
            filteredData = filteredData.filter(item => 
              item.customer.includes(customerName)
            );
          }
          
          if (documentNo) {
            filteredData = filteredData.filter(item => 
              item.documentNo.includes(documentNo)
            );
          }
          
          if (status) {
            filteredData = filteredData.filter(item => 
              item.status === status
            );
          }
        }
        
        resolve({
          total: filteredData.length,
          data: filteredData
        });
      }, 300);
    });
  },

  // 获取付款单列表
  getPaymentList(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredData = [...paymentList];
        
        // 处理搜索条件
        if (params) {
          const { dateRange, supplierName, documentNo, status } = params;
          
          if (dateRange && dateRange.length === 2) {
            filteredData = filteredData.filter(item => 
              item.date >= dateRange[0] && item.date <= dateRange[1]
            );
          }
          
          if (supplierName) {
            filteredData = filteredData.filter(item => 
              item.supplier.includes(supplierName)
            );
          }
          
          if (documentNo) {
            filteredData = filteredData.filter(item => 
              item.documentNo.includes(documentNo)
            );
          }
          
          if (status) {
            filteredData = filteredData.filter(item => 
              item.status === status
            );
          }
        }
        
        resolve({
          total: filteredData.length,
          data: filteredData
        });
      }, 300);
    });
  },

  // 新增入库单
  addStockIn(data) {
    return new Promise((resolve) => {
      data.id = generateId();
      data.createTime = new Date().toLocaleString();
      data.status = '待审核';
      stockInList.unshift(data);
      setTimeout(() => resolve(data), 300);
    });
  },

  // 新增出库单
  addStockOut(data) {
    return new Promise((resolve) => {
      data.id = generateId();
      data.createTime = new Date().toLocaleString();
      data.status = '待审核';
      stockOutList.unshift(data);
      setTimeout(() => resolve(data), 300);
    });
  },

  // 新增收款单
  addReceipt(data) {
    return new Promise((resolve) => {
      data.id = generateId();
      data.createTime = new Date().toLocaleString();
      data.status = '待审核';
      receiptList.unshift(data);
      setTimeout(() => resolve(data), 300);
    });
  },

  // 新增付款单
  addPayment(data) {
    return new Promise((resolve) => {
      data.id = generateId();
      data.createTime = new Date().toLocaleString();
      data.status = '待审核';
      paymentList.unshift(data);
      setTimeout(() => resolve(data), 300);
    });
  },

  // 审核单据
  auditDocument(id, type) {
    return new Promise((resolve) => {
      const list = type === 'in' ? stockInList : stockOutList;
      const doc = list.find(item => item.id === id);
      if (doc) {
        doc.status = '已审核';
      }
      setTimeout(() => resolve(true), 300);
    });
  },

  // 审核收付款单
  auditFinanceDocument(id, type) {
    return new Promise((resolve) => {
      const list = type === 'receipt' ? receiptList : paymentList;
      const doc = list.find(item => item.id === id);
      if (doc) {
        doc.status = '已审核';
      }
      setTimeout(() => resolve(true), 300);
    });
  },

  // 删除单据
  deleteDocument(id, type) {
    return new Promise((resolve) => {
      const list = type === 'in' ? stockInList : stockOutList;
      const index = list.findIndex(item => item.id === id);
      if (index > -1) {
        list.splice(index, 1);
      }
      setTimeout(() => resolve(true), 300);
    });
  },

  // 删除收付款单
  deleteFinanceDocument(id, type) {
    return new Promise((resolve) => {
      const list = type === 'receipt' ? receiptList : paymentList;
      const index = list.findIndex(item => item.id === id);
      if (index > -1) {
        list.splice(index, 1);
      }
      setTimeout(() => resolve(true), 300);
    });
  }
};
