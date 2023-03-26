const User = require('../../models/User');

const findUserByIdAndUpdateReq = async (id, req) => {
    const user = await User.findById(id);
    req.session.hasPartner = user.hasPartner;
    return user;
}

module.exports = {
    findUserByIdAndUpdateReq,
}