// pages/login/login.js
Page({
  data: {
    showRoleSelector: false,
    selectedRole: null,
    userInfo: null
  },

  // 微信授权登录
  loginWithWechat() {
    const that = this
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: function(res) {
        that.setData({
          userInfo: res.userInfo,
          showRoleSelector: true
        })
      },
      fail: function(res) {
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  // 选择角色
  selectRole(e) {
    this.setData({
      selectedRole: e.currentTarget.dataset.role
    })
  },

  // 确认角色选择
  confirmRole() {
    const { selectedRole, userInfo } = this.data
    if (!selectedRole) return

    // 存储用户信息和角色到全局和缓存
    const app = getApp()
    app.globalData.userInfo = userInfo
    app.globalData.role = selectedRole

    wx.setStorageSync('userInfo', userInfo)
    wx.setStorageSync('role', selectedRole)

    // 调用登录云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {
        role: selectedRole,
        userInfo: userInfo
      },
      success: (res) => {
        // 根据角色跳转到对应首页
        if (selectedRole === 'teacher') {
          wx.switchTab({ url: '/pages/teacher/home/home' })
        } else {
          wx.switchTab({ url: '/pages/student/home/home' })
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  onLoad() {
    // 检查是否已登录
    const userInfo = wx.getStorageSync('userInfo')
    const role = wx.getStorageSync('role')
    if (userInfo && role) {
      const app = getApp()
      app.globalData.userInfo = userInfo
      app.globalData.role = role
      
      // 直接跳转到对应首页
      if (role === 'teacher') {
        wx.switchTab({ url: '/pages/teacher/home/home' })
      } else {
        wx.switchTab({ url: '/pages/student/home/home' })
      }
    }
  }
})