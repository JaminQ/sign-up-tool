const cloud = require('wx-server-sdk')
cloud.init({
  env: 'sign-up-652910'
})

const db = cloud.database()
const _ = db.command
const managerList = ['op0Ga5SBv7L-WplYadTXdHH9k0vM', 'op0Ga5e1bCfwp44jLmE4I35KAnKg', 'op0Ga5RNo4x4BObCHj0mGCV89wbQ'] // 管理员openId
const classesCollection = db.collection('classes')
const userCollection = db.collection('user')
const signListCollection = db.collection('sign-list')

exports.main = async (event, context) => {
  console.log('event:', event)

  const openId = event.userInfo.openId

  // 拦截请求
  if (['add', 'update', 'remove'].indexOf(event.type) > -1) { // 管理员相关操作
    // 拦截非管理员用户的请求
    if (managerList.indexOf(openId) === -1) {
      console.log('非管理员')
      return {
        ret: -10000 // 非管理员
      }
    }
  } else { // 非管理员相关操作
  }

  switch (event.type) {
    case 'add':
      try {
        const data = event.formValue
        data.leftNum = data.maxNum
        data._openid = openId
        data.createTime = db.serverDate()

        const res = await classesCollection.add({
          data
        })
        data._id = res._id
        res._data = data

        return res
      } catch (e) {
        console.error(e)
      }
      break
    case 'update':
      try {
        const data = event.formValue
        return await classesCollection.doc(event._id).update({
          data
        })
      } catch (e) {
        console.error(e)
      }
      break
    case 'remove':
      try {
        return await classesCollection.doc(event._id).remove()
      } catch (e) {
        console.error(e)
      }
      break
    case 'signUp':
      try {
        const doc = classesCollection.doc(event._id)

        // 获取课程剩余名额
        const { data: { leftNum } } = await doc.get()
        if (leftNum > 0) {
          await doc.update({
            data: {
              leftNum: _.inc(-1)
            }
          })
          return await signListCollection.add({
            data: {
              classId: event._id,
              _openid: openId,
              name: event.name,
              tel: event.tel,
              createTime: db.serverDate()
            }
          })
        } else {
          return {
            ret: -10001 // 课程报名人数已满
          }
        }
      } catch (e) {
        console.error(e)
      }
      break
    case 'signOut':
      try {
        await signListCollection.where({
          _openid: openId,
          classId: event._id,
          name: event.name
        }).remove()
        await classesCollection.doc(event._id).update({
          data: {
            leftNum: _.inc(1)
          }
        })
        return {
          ret: 0
        }
      } catch (e) {
        console.error(e)
      }
      break
    default:
  }
}