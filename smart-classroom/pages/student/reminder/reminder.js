// pages/student/reminder/reminder.js
Page({
  data: {
    selectedTime: '09:00',
    frequencies: ['每天', '每周'],
    frequencyIndex: 0,
    reminderMessage: '该学习啦！',
    aiMessage: '',
    reminders: []
  },

  onLoad() {
    this.getReminders()
  },

  // 获取已设置的提醒
  getReminders() {
    // 模拟数据
    this.setData({
      reminders: [
        {
          _id: '1',
          time: '09:00',
          frequency: '每天',
          message: '上午学习时间到！',
          aiMessage: '加油！今天也要努力学习哦！',
          isActive: true
        },
        {
          _id: '2',
          time: '18:00',
          frequency: '每天',
          message: '下午学习时间到！',
          aiMessage: '坚持就是胜利，你一定可以的！',
          isActive: true
        }
      ]
    })
    
    // 后续可以从云数据库获取提醒
    // wx.cloud.callFunction({
    //   name: 'reminder',
    //   data: {
    //     action: 'read'
    //   },
    //   success: (res) => {
    //     this.setData({
    //       reminders: res.result.data || []
    //     })
    //   }
    // })
  },

  // 时间选择变化
  onTimeChange(e) {
    this.setData({
      selectedTime: e.detail.value
    })
  },

  // 频率选择变化
  onFrequencyChange(e) {
    this.setData({
      frequencyIndex: e.detail.value
    })
  },

  // 提醒消息变化
  onMessageChange(e) {
    this.setData({
      reminderMessage: e.detail.value
    })
  },

  // 生成AI鼓励语
  generateEncouragement() {
    wx.showLoading({ title: 'AI生成中...' })
    
    // 模拟AI生成鼓励语
    setTimeout(() => {
      wx.hideLoading()
      this.setData({
        aiMessage: '你是最棒的！相信自己，一定能够取得好成绩！'
      })
    }, 1500)
    
    // 后续可以调用云函数生成真实的鼓励语
    // wx.cloud.callFunction({
    //   name: 'ai-service',
    //   data: {
    //     action: 'generateEncouragement'
    //   },
    //   success: (res) => {
    //     wx.hideLoading()
    //     this.setData({
    //       aiMessage: res.result.encouragement
    //     })
    //   },
    //   fail: (err) => {
    //     wx.hideLoading()
    //     wx.showToast({
    //       title: '生成失败，请重试',
    //       icon: 'none'
    //     })
    //   }
    // })
  },

  // 保存提醒
  saveReminder() {
    const { selectedTime, frequencies, frequencyIndex, reminderMessage, aiMessage } = this.data
    
    const newReminder = {
      _id: Date.now().toString(),
      time: selectedTime,
      frequency: frequencies[frequencyIndex],
      message: reminderMessage,
      aiMessage: aiMessage,
      isActive: true
    }
    
    this.setData({
      reminders: [...this.data.reminders, newReminder]
    })
    
    wx.showToast({
      title: '提醒保存成功',
      icon: 'success'
    })
    
    // 后续可以调用云函数保存到数据库
    // wx.cloud.callFunction({
    //   name: 'reminder',
    //   data: {
    //     action: 'create',
    //     reminder: newReminder
    //   },
    //   success: (res) => {
    //     wx.showToast({
    //       title: '提醒保存成功',
    //       icon: 'success'
    //     })
    //     this.getReminders()
    //   },
    //   fail: (err) => {
    //     wx.showToast({
    //       title: '保存失败，请重试',
    //       icon: 'none'
    //     })
    //   }
    // })
  },

  // 编辑提醒
  editReminder(e) {
    const index = e.currentTarget.dataset.index
    const reminder = this.data.reminders[index]
    
    this.setData({
      selectedTime: reminder.time,
      frequencyIndex: this.data.frequencies.indexOf(reminder.frequency),
      reminderMessage: reminder.message,
      aiMessage: reminder.aiMessage
    })
  },

  // 删除提醒
  deleteReminder(e) {
    const index = e.currentTarget.dataset.index
    const reminders = this.data.reminders
    reminders.splice(index, 1)
    
    this.setData({
      reminders: reminders
    })
    
    wx.showToast({
      title: '提醒删除成功',
      icon: 'success'
    })
    
    // 后续可以调用云函数删除
    // wx.cloud.callFunction({
    //   name: 'reminder',
    //   data: {
    //     action: 'delete',
    //     id: reminderId
    //   },
    //   success: (res) => {
    //     wx.showToast({
    //       title: '提醒删除成功',
    //       icon: 'success'
    //     })
    //     this.getReminders()
    //   }
    // })
  }
})