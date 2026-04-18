// pages/teacher/home/home.js
Page({
  data: {
    userInfo: null,
    assignments: []
  },

  onLoad() {
    // 获取用户信息
    const app = getApp()
    this.setData({
      userInfo: app.globalData.userInfo
    })
    
    // 获取作业列表
    this.getAssignments()
  },

  // 获取作业列表
  getAssignments() {
    wx.cloud.callFunction({
      name: 'assignment',
      data: {
        action: 'read'
      },
      success: (res) => {
        this.setData({
          assignments: res.result.data || []
        })
      },
      fail: (err) => {
        wx.showToast({
          title: '获取作业失败',
          icon: 'none'
        })
      }
    })
  },

  // 导航到发布作业页面
  navigateToCreate() {
    wx.navigateTo({
      url: '/pages/teacher/create/create'
    })
  },

  // 查看作业详情
  viewAssignment(e) {
    const assignmentId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/teacher/create/create?id=${assignmentId}`
    })
  },

  // 格式化日期
  formatDate(date) {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  },

  onPullDownRefresh() {
    this.getAssignments()
    wx.stopPullDownRefresh()
  }
})