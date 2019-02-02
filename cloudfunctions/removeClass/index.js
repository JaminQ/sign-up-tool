const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const classesCollection = db.collection('classes')
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await classesCollection.where({
      name: _.neq('')
    }).remove()
  } catch (e) {
    console.error(e)
  }
}