// cloudfunctions/quiz/index.js
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { action, assignmentId, answers, score, duration } = event
  const wxContext = cloud.getWXContext()
  
  try {
    switch (action) {
      case 'submit':
        // 提交做题结果
        const submitResult = await db.collection('quiz_results').add({
          data: {
            studentId: wxContext.OPENID,
            assignmentId: assignmentId,
            answers: answers,
            score: score,
            duration: duration,
            createdAt: db.serverDate()
          }
        })
        return {
          success: true,
          data: {
            _id: submitResult._id,
            studentId: wxContext.OPENID,
            assignmentId: assignmentId,
            answers: answers,
            score: score,
            duration: duration,
            createdAt: new Date()
          }
        }
        
      case 'get':
        // 获取做题结果
        if (assignmentId) {
          // 获取特定作业的做题结果
          const result = await db.collection('quiz_results')
            .where({
              studentId: wxContext.OPENID,
              assignmentId: assignmentId
            })
            .get()
          return {
            success: true,
            data: result.data[0]
          }
        } else {
          // 获取所有做题结果
          const results = await db.collection('quiz_results')
            .where({ studentId: wxContext.OPENID })
            .orderBy('createdAt', 'desc')
            .get()
          return {
            success: true,
            data: results.data
          }
        }
        
      default:
        return {
          success: false,
          error: 'Invalid action'
        }
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err.message
    }
  }
}