// cloudfunctions/assignment/index.js
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { action, assignment, id } = event
  const wxContext = cloud.getWXContext()
  
  try {
    switch (action) {
      case 'create':
        // 创建作业
        const createResult = await db.collection('assignments').add({
          data: {
            teacherId: wxContext.OPENID,
            title: assignment.title,
            subject: assignment.subject,
            questions: assignment.questions,
            createdAt: db.serverDate(),
            updatedAt: db.serverDate()
          }
        })
        return {
          success: true,
          data: {
            _id: createResult._id,
            ...assignment,
            teacherId: wxContext.OPENID,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
        
      case 'read':
        // 读取作业列表或单个作业
        if (id) {
          // 读取单个作业
          const assignmentData = await db.collection('assignments')
            .doc(id)
            .get()
          return {
            success: true,
            data: assignmentData.data
          }
        } else {
          // 读取作业列表
          const assignments = await db.collection('assignments')
            .where({ teacherId: wxContext.OPENID })
            .orderBy('createdAt', 'desc')
            .get()
          return {
            success: true,
            data: assignments.data
          }
        }
        
      case 'update':
        // 更新作业
        await db.collection('assignments')
          .doc(id)
          .update({
            data: {
              title: assignment.title,
              subject: assignment.subject,
              questions: assignment.questions,
              updatedAt: db.serverDate()
            }
          })
        return {
          success: true,
          data: {
            _id: id,
            ...assignment,
            updatedAt: new Date()
          }
        }
        
      case 'delete':
        // 删除作业
        await db.collection('assignments')
          .doc(id)
          .remove()
        return {
          success: true
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