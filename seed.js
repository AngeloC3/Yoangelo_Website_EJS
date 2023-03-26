const User = require('./models/User')
const Notification = require('./models/Notification')
const bcrypt = require("bcrypt");

const mongoose = require("mongoose");
const mongodb_URI = 'mongodb://0.0.0.0:27017/'
mongoose.connect(mongodb_URI, {
    dbName: 'yoangelo_website_db',
    useNewUrlParser: true,
    useUnifiedTopology: true 
}).then(() => console.log("Connected to MongoDB")).catch(error => console.log(error));
const db = mongoose.connection;

const userObjs = []
howManyUsers = 3

const seedUsers = async () => {
  for (let i = 1; i <= howManyUsers; i++){
    userString = "user" + i;
    const hashedPassword = await bcrypt.hash(userString, 10);
    let tempUser = {
        username: userString,
        email: userString + "@" + "fake.com",
        password: hashedPassword,
    };
    userObjs.push(tempUser);
  } 
  await User.deleteMany({});
  await User.insertMany(userObjs);
  console.log("users added")
}

const sendPairRequest = async (senderId, recieverId) => {
  return await Notification.create({
    recipientId: recieverId,
    senderId: senderId,
    notifDetails: {
      notifType: "pair-request",
    }
});
}

const seedPairRequests = async () => {
  await Notification.deleteMany({});
  const notifUsers = [];
  for (let i = 0; i < howManyUsers; i++) {
    const user = await User.findOne({ email: userObjs[i].email });
    notifUsers.push(user);
  }
  const [u1, u2, u3] = notifUsers;
  await sendPairRequest(u3, u1);
  await sendPairRequest(u2, u1);
  console.log("sent pair requests");
}

seedUsers()
.then(() => {
  return seedPairRequests();
})
.then(() => {
  console.log("closing")
  db.close()
})