const router = require('express').Router();
const User = require('../../models/User');
const PasswordResetToken = require('../../models/PasswordResetToken');
const jwt = require('jsonwebtoken');
const dummy_jwt = "thisismysecrctekeyforjwticdf8wehjidjs9";
const nodemailer = require("nodemailer");

router.get("/request_reset", (req, res) => {
    res.render("forms/formContainer", {form: 'requestPassResetForm.ejs'})
})

router.post("/request_reset", async (req, res) => {
    const email = req.body.email;
    const user = await User.findOne({email: email});
    if (!user){
        req.flash("error", "An account with that email was not found.")
        res.redirect("request_reset");
        return;
    }
    if (user.google.id){
      req.flash("error", "This website cannot reset the password associated with a Google account. Reset your password via Google!")
      res.redirect("request_reset");
      return;
    }
    const jwt_secret = process.env.JWT_SECRET || dummy_jwt;
    const token = jwt.sign(
        {
          userId: user._id,
          username: user.username
        },
        jwt_secret,
        {
          expiresIn: '1h',
        }
    );
    await PasswordResetToken.deleteOne({userId: user._id}).then(async() => {
      await PasswordResetToken.create({
        userId: user._id,
        token: token,
      });
    });
    
    // send email out
    const website_email = 'yoangelo.website@gmail.com';
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: website_email,
        pass: process.env.WEBSITE_EMAIL_PASS
      }
    });;
    const mailOptions = {
        from: website_email,
        to: user.email,
        subject: "Password Reset Request",
        text: `Hi ${user.username},\n\nPlease click the following link to reset your password:\n\nhttp://${req.headers.host}/auth/password/reset/${token}\n\nThis link will expire in 1 hour.\n\nIf you did not request a password reset, please ignore this email.\n`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          req.flash("error", "There was an error sending the email. Sorry!")
          res.redirect("request_reset");
          return;
        } else {
        console.log("Email sent: " + info.response);
        req.flash("success", `Email has been successfully sent to ${user.email}!`)
        res.redirect("request_reset");
        return;
        }
    });
})

router.get("/reset/:token", async(req, res, next) => {
    const token = req.params.token;
    const jwt_secret = process.env.JWT_SECRET || dummy_jwt;
    jwt.verify(token, jwt_secret, async (err, decoded) => {
      if (err) {
        const error = new Error('Invalid or Expired Reset Token');
        error.status = 400;
        return next(error);
      }
      const resetToken = await PasswordResetToken.findOne({
        userId: decoded.userId,
        token: token,
      });
      if (!resetToken) {
        const error = new Error('Invalid or Expired Reset Token');
        error.status = 400;
        return next(error);
      }
      res.locals.userId = decoded.userId;
      res.locals.token = token;
      res.locals.username = decoded.username;
      res.render('forms/formContainer', { form: 'resetPassForm'});
    });
});

router.post("/reset", async(req, res, next) => {
    const { password, token, userId } = req.body;
    const resetToken = await PasswordResetToken.findOne({
        token: token,
    });
    if (!resetToken) {
        const error = new Error('Invalid or Expired Reset Token');
        error.status = 400;
        return next(error);
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
          const error = new Error('Error finding your data');
          error.status = 400;
          return next(error);
        }
        user.setPassword(password, async (err) => {
          if (err) {
            return next(err);
          } else {
            await user.save();
          }
        });
        } catch (err) {
            return next(err);
    }
    await resetToken.deleteOne();
    req.flash('success', 'Password successfully reset');
    res.redirect('/auth/login');
});


module.exports = router;