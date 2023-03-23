// middleware to test is the user is logged in, and if not, send them to the login page
const isLoggedIn = (req,res,next) => {
    if (res.locals.loggedIn) {
      next()
    }
    else res.redirect('/login')
  }

function isUserSchemaDifferent(user, data){
  try{
    c1 = user._id.equals(data._id)
  } catch {
    c1 = user._id === data._id
  }
  c2 = user.username === data.username
  try{
      c3 = user.partnerId.equals(data.partnerId)
  } catch {
      c3 = user.partnerId === data.partnerId
  }
  c4 = user.partnerCode === data.partnerCode
  //console.log(c1, c2, c3, c4)
  return !(c1 && c2 && c3 && c4)
}

const User = require('../models/User');

async function checkUserChange(req){
  currUser = req.session.user
  userCheck = await User.findById(currUser._id)
  if (isUserSchemaDifferent(currUser, userCheck)){
    req.session.user = userCheck
  }
}

module.exports = { isLoggedIn , isUserSchemaDifferent, checkUserChange};