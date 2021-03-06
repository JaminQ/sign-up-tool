const cloud = require('wx-server-sdk')
cloud.init({
  env: 'sign-up-652910'
})

const db = cloud.database()
const userCollection = db.collection('user')

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const userData = await userCollection.where({
    _openid: wxContext.OPENID
  }).get()

  if (userData.data.length === 0) {
    try {
      await userCollection.add({
        data: {
          _openid: wxContext.OPENID,
          classes: [],
          childInfo: [],
          name: '',
          tel: '',
          wxAlias: ''
        }
      })
    } catch (e) {
      console.error(e)
    }
  }

  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID
  }
}