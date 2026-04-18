//app.js
App({
  onLaunch: function() {
    // 初始化云开发
    wx.cloud.init({
      env: 'your-cloud-env-id',
      traceUser: true
    })
  },
  globalData: {
    userInfo: null,
    role: null
  }
})