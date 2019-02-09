const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const _ = db.command
const classesCollection = db.collection('classes')
const userCollection = db.collection('user')

exports.main = async (event, context) => {
  switch (event.type) {
    case 'add':
      try {
        const data = event.formValue
        data.menberList = []
        data._openid = event.userInfo.openId
        data.createTime = db.serverDate()
        return await classesCollection.add({
          data
        })
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
        const { data: { menberList, maxNum } } = await classesCollection.doc(event._id).get()
        if (menberList.length < maxNum) {
          await classesCollection.doc(event._id).update({
            data: {
              menberList: _.push({
                _openid: event.userInfo.openId,
                name: event.name,
                createTime: db.serverDate()
              })
            }
          })
          return await userCollection.where({
            _openid: event.userInfo.openId
          }).update({
            data: {
              classes: _.push(event._id)
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
        const { data: { menberList } } = await classesCollection.doc(event._id).get()
        menberList.splice(event.menberIdx, 1)
        await classesCollection.doc(event._id).update({
          data: {
            menberList: _.set(menberList)
          }
        })

        const signedUpList = await userCollection.where({
          _openid: event.userInfo.openId
        }).get()
        const classes = signedUpList.data[0].classes
        classes.splice(classes.indexOf(event._id), 1)
        return await userCollection.where({
          _openid: event.userInfo.openId
        }).update({
          data: {
            classes: _.set(classes)
          }
        })
      } catch (e) {
        console.error(e)
      }
      break
    default:
  }
}