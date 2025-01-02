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
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
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
  background-color: #f0f2f5;
}

.el-aside {
  background-color: #001529;
  box-shadow: 2px 0 6px rgba(0,21,41,.35);
  transition: all 0.3s;
  overflow: hidden;
  position: relative;
  z-index: 10;
}

.el-menu-vertical {
  height: 100%;
  border-right: none;
  background-color: #001529;

  .el-menu-item {
    height: 56px;
    line-height: 56px;
    display: flex;
    align-items: center;
    padding: 0 20px !important;
    margin: 4px 0;
    color: rgba(255,255,255,0.65);
    transition: all 0.3s;

    &:hover {
      color: #fff;
      background-color: #1890ff !important;
    }

    &.is-active {
      color: #fff;
      background-color: #1890ff !important;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background-color: #fff;
      }
    }

    .el-icon {
      font-size: 18px;
      margin-right: 10px;
      vertical-align: middle;
    }

    span {
      font-size: 14px;
      font-weight: 500;
      vertical-align: middle;
    }
  }
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  position: relative;
  z-index: 9;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #001529;
    letter-spacing: 0.5px;
  }

  .user-info {
    display: flex;
    align-items: center;

    .el-dropdown-link {
      display: flex;
      align-items: center;
      padding: 0 12px;
      height: 40px;
      color: #666;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;
      border-radius: 4px;

      &:hover {
        background: rgba(0,0,0,.025);
        color: #1890ff;
      }

      .el-icon {
        margin-left: 4px;
        font-size: 12px;
      }
    }
  }
}

.el-dropdown-menu {
  padding: 4px 0;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);

  .el-dropdown-menu__item {
    line-height: 36px;
    padding: 0 16px;
    font-size: 14px;
    color: #606266;
    transition: all 0.3s;

    &:hover {
      background-color: #f5f7fa;
      color: #1890ff;
    }

    &.danger {
      color: #f56c6c;
      
      &:hover {
        background-color: #fef0f0;
        color: #f56c6c;
      }
    }
  }
}

.el-main {
  padding: 20px;
  overflow-x: hidden;
}

/* 添加路由过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.5s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
