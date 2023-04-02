const User = require('./models/User')
const Notification = require('./models/Notification')
const TodoItem = require('./models/TodoItem')
const Countdown = require('./models/Countdown')
const Wishlist = require('./models/Wishlist')
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
    const randomSpaces = Math.floor(Math.random() * 20) + 1; // change inner val to higher for longer descrptions
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
    const creator = (i % 2 === 0) ? u1 : u2;
    await createTodo(creator, i);
  }
  console.log(`created ${howManyTodos} todo items`);
}

const seedCountdowns = async () => {
  const createCountdown = async (creator, i) => {
    const now = new Date();
    const randomMilisecs = Math.floor(Math.random() * 31536000000); // num milisecs in a year
    const randomDate = new Date(now.getTime() + randomMilisecs);

    return await Countdown.create({
      creatorInfo: {
        creatorId: creator._id,
        creatorName: creator.username
      },
      title: "Countdown " + i,
      endsAt: randomDate
    });
  };

  await Countdown.deleteMany({});
  const countdownUsers = [];
  for (let i = 0; i < 2; i++) {
    const user = await User.findOne({ email: userObjs[i].email });
    countdownUsers.push(user);
  }
  const [u1, u2] = countdownUsers;
  const howManyCountdowns = 5;
  for (let i = 0; i < howManyCountdowns; i++) {
    const creator = (i % 2 === 0) ? u1 : u2;
    await createCountdown(creator, i);
  }
  console.log(`created ${howManyCountdowns} countdowns`);
};

const seedWishlists = async () => {
  const createWishlist = async (creator, i) => {
    const randType = 'wishlist';
    const randInt = Math.floor(Math.random() * 10) + 1;
    const randomPrice = Math.floor(Math.random() * 999) + 1;
    const randomSpaces = Math.floor(Math.random() * 20) + 1; // change inner val to higher for longer descrptions
    let description = randType;
    for (let i = 0; i < randomSpaces; i++) {
      description += " " + randType;
    }
    let url = undefined
    if (Math.random() >= .5) url = '#';

    return await Wishlist.create({
      creatorInfo: {
        creatorId: creator._id,
        creatorName: creator.username
      },
      title: "Wishlist " + i,
      description: description,
      price: randomPrice,
      rating: randInt,
      url: url
    });
  };

  await Wishlist.deleteMany({});
  const wishlistUsers = [];
  for (let i = 0; i < 2; i++) {
    const user = await User.findOne({ email: userObjs[i].email });
    wishlistUsers.push(user);
  }
  const [u1, u2] = wishlistUsers;
  const howManyCountdowns = 5;
  for (let i = 0; i < howManyCountdowns; i++) {
    const creator = (i % 2 === 0) ? u1 : u2;
    await createWishlist(creator, i);
  }
};

seedUsers()
.then(() => { return seedPairRequests(true) })
.then(() => { return seedTodos() })
.then(() => { return seedCountdowns() })
.then(() => { return seedWishlists() })
.then(() => {
  console.log("closing")
  db.close()
})