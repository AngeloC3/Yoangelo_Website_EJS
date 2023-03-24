const User = require('./models/User')
const bcrypt = require("bcrypt");

const mongoose = require("mongoose");
const mongodb_URI = 'mongodb://0.0.0.0:27017/'
mongoose.connect(mongodb_URI, {
    dbName: 'yoangelo_website_db',
    useNewUrlParser: true,
    useUnifiedTopology: true 
}).then(() => console.log("Connected to MongoDB")).catch(error => console.log(error));

async function seedUp() {
    const users = []

    for (let i = 1; i <= 3; i++){
        userString = "user" + i;
        const hashedPassword = await bcrypt.hash(userString, 10);
        let tempUser = {
            username: userString,
            email: userString + "@" + "fake.com",
            password: hashedPassword,
        };
        users.push(tempUser);
    }
    
    User.deleteMany({}).then(() => {
        console.log("Subscriber data is empty");
        users.forEach((u) => {
            const user = User.create({
                username: u.username,
                email: u.email,
                password: u.password,
            })
              .then((r) => {
                console.log(r);
              })
              .catch((error) => {
                console.log(`ERROR: ${error}`);
              })
        });
      });
}

seedUp();