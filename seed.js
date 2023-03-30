const User = require('./models/User')
const Notification = require('./models/Notification')
const TodoItem = require('./models/TodoItem')
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

const seedPairRequests = async (u1u2_pair = false) => {

  const sendPairRequest = async (senderId, recieverId) => {
    return await Notification.create({
      recipientId: recieverId,
      senderId: senderId,
      notifDetails: {
        notifType: "pair-request",
      }
  });
  }

  await Notification.deleteMany({});
  const notifUsers = [];
  for (let i = 0; i < howManyUsers; i++) {
    const user = await User.findOne({ email: userObjs[i].email });
    notifUsers.push(user);
  }
  const [u1, u2, u3] = notifUsers;
  await sendPairRequest(u3, u1);
  if (u1u2_pair) {
    userId = u1._id;
    partnerId = u2._id;
    await User.findByIdAndUpdate(partnerId, { partnerId: userId });
    await User.findByIdAndUpdate(userId, { partnerId: partnerId });
    await Notification.create({
      recipientId: userId,
      notifDetails: {
          notifType: "system",
          notifMessage: "You have successfully paired with user2!"
      }
    });
    console.log("first 2 users paired");
  } else {
    await sendPairRequest(u2, u1);
  }
  console.log("sent pair requests");
}

const seedTodos = async () => {

  const todoTypes = ['watch_list', 'bucket_list', 'reading_list'];

  const createTodo = async (creator, i) => {
    const randType = todoTypes[Math.floor(Math.random() * todoTypes.length)];
    const randInt = Math.floor(Math.random() * 10) + 1;
    const randomSpaces = Math.floor(Math.random() * 0) + 1; // change inner val to higher for longer descrptions
    let description = randType;
    for (let i = 0; i < randomSpaces; i++) {
      description += " " + randType;
    }

    return await TodoItem.create({
      creatorInfo: {
        creatorId: creator._id,
        creatorName: creator.username
      },
      todoType: randType,
      title: randType + " " + i,
      description: description,
      creatorRate: randInt
    })
  }

  await TodoItem.deleteMany({});
  const todoUsers = [];
  for (let i = 0; i < 2; i++) {
    const user = await User.findOne({ email: userObjs[i].email });
    todoUsers.push(user);
  }
  const [u1, u2] = todoUsers;
  const howManyTodos = 20;
  for (let i = 0; i < howManyTodos; i++) {
    let creator = undefined;
    creator = (i % 2 === 0) ? u1 : u2;
    await createTodo(creator, i);
  }
  console.log(`created ${howManyTodos} todo items`);
}

seedUsers()
.then(() => {
  return (
    seedPairRequests(true) 
    && seedTodos()
    );
})
.then(() => {
  console.log("closing")
  db.close()
})