const User = require('../../models/User');

const findUserByIdAndUpdateReqSession = async (id, req) => {
    const user = await User.findById(id);
    req.session.hasPair = user.pairId !== null;
    return user;
}

const todoTypeToTitle = (type) => {
    const words = type.split("_");
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords.join(" ");
  };

module.exports = {
    findUserByIdAndUpdateReqSession,
    todoTypeToTitle,
}