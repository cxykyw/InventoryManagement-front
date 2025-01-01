import { createRouter, createWebHistory } from 'vue-router'
import StockIn from '../views/StockIn.vue'
import StockOut from '../views/StockOut.vue'

const routes = [
  {
    path: '/',
    redirect: '/stock-in'
  },
  {
    path: '/stock-in',
    name: 'StockIn',
    component: StockIn,
    meta: { title: '入库管理' }
  },
  {
    path: '/stock-out',
    name: 'StockOut',
    component: StockOut,
    meta: { title: '出库管理' }
  },
  {
    path: '/sales-detail',
    name: 'SalesDetail',
    component: () => import('../views/SalesDetail.vue'),
    meta: {
      title: '销售明细表'
    }
  },
  {
    path: '/receipt',
    name: 'Receipt',
    component: () => import('../views/Receipt.vue'),
    meta: {
      title: '收款单'
    }
  },
  {
    path: '/payment',
    name: 'Payment',
    component: () => import('../views/Payment.vue'),
    meta: {
      title: '付款单'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
