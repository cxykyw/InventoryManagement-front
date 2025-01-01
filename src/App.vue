<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <el-menu
        :router="true"
        :default-active="activeMenu"
        class="el-menu-vertical"
      >
        <el-menu-item index="/stock-in">
          <el-icon><Goods /></el-icon>
          <span>入库管理</span>
        </el-menu-item>
        <el-menu-item index="/stock-out">
          <el-icon><SoldOut /></el-icon>
          <span>出库管理</span>
        </el-menu-item>
        <el-menu-item index="/sales-detail">
          <el-icon><DataLine /></el-icon>
          <span>销售明细表</span>
        </el-menu-item>
        <el-menu-item index="/receipt">
          <el-icon><Money /></el-icon>
          <span>收款单</span>
        </el-menu-item>
        <el-menu-item index="/payment">
          <el-icon><Wallet /></el-icon>
          <span>付款单</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header height="60px">
        <div class="header-content">
          <h2>仓库管理系统</h2>
          <div class="user-info">
            <el-dropdown>
              <span class="el-dropdown-link">
                管理员 <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人信息</el-dropdown-item>
                  <el-dropdown-item>修改密码</el-dropdown-item>
                  <el-dropdown-item divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Document, Goods, ArrowDown, SoldOut, DataLine, Money, Wallet } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style>
.layout-container {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
}

.el-menu-vertical {
  height: 100%;
  background-color: #304156;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 200px;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  padding: 0 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-content h2 {
  margin: 0;
  color: #303133;
}

.user-info {
  cursor: pointer;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  color: #606266;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
