// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { role, userInfo } = event
  const wxContext = cloud.getWXContext()
  
  try {
    // 检查用户是否已存在
    const existingUser = await db.collection('users')
      .where({ openid: wxContext.OPENID })
      .get()
    
    let user
    if (existingUser.data.length > 0) {
      // 更新用户信息
      await db.collection('users')
        .where({ openid: wxContext.OPENID })
        .update({
          data: {
            name: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            role: role,
            updatedAt: db.serverDate()
          }
        })
      user = existingUser.data[0]
      user.role = role
    } else {
      // 创建新用户
      const result = await db.collection('users').add({
        data: {
          openid: wxContext.OPENID,
          name: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          role: role,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })
      user = {
        _id: result._id,
        openid: wxContext.OPENID,
        name: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        role: role
      }
    }
    
    return {
      success: true,
      user: user
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err.message
    }
  }
}