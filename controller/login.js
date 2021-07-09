require('dotenv').config();
//const user = require("../model/login");
const { User,  urlShort } = require("../model/login");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const shortUrl = require('node-url-shortener');
const { NotExtended } = require('http-errors');

const saltRounds = 10;

const getUser = async () => {
    const loginUser = await User.find().exec();
    return loginUser;
}

const registerUser = async (firstname, lastname, email, password) => {
    const checkUser = await User.findOne({ email }).exec();
    console.log(checkUser);
    if (!checkUser) {
        const hash = bcrypt.hashSync(password, saltRounds);

        const account = await nodemailer.createTestAccount();

        const mailer = nodemailer.createTransport({
            name: 'gmail.com',
            host: "smtp.gmail.com",
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: {
                user: process.env.sender,
                pass: process.env.password
            }
        });
        var shrt_url;
        shortUrl.short(`http://localhost:4200/activate/${email}`, function (err, url) {
            shrt_url = url;
            console.log(shrt_url);
            let info = mailer.sendMail({
                from: process.env.sender,
                to: email, // list of receivers
                subject: "Account activation ✔", // Subject line
                text: "Account activation",  // plain text body
                html: `<a href= "${shrt_url}" >Click on this active account</a>`,
            })
        });

        const newUser = await new User({ firstname, lastname, email, password: hash, url: shrt_url, status: false }).save();
        const data = { status: 200, msg: "Check your email and activate your account", newUser };
        return data;

    } else {
        if (checkUser.status == false) {
            const hash = bcrypt.hashSync(password, saltRounds);
            const updateData = await User.updateOne({ email: email },
                {
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    password: hash,
                    url: shrt_url,
                    status: false
                });

            const data = { status: 200, msg: "Check your email and activate your account", updateData };
            return data;
        } else {
            const data = { status: 409, msg: "user already exit" };
            return data;
        }

    }
}

const loginUser = async (email, password) => {
    const checkUser = await User.findOne({ email }).exec();
    //console.log(checkUser);
    if (checkUser) {
        const isUserPassword = bcrypt.compareSync(password, checkUser.password);
        if (checkUser.status == false) {
            const data = { status: 401, msg: "user is Inactivate. Please activate your account" };
            return data;
        }
        else if (isUserPassword) {
            const data = { status: 200, msg: "user is Authenticated", checkUser };
            return data;
        } else {
            const data = { status: 401, msg: "incorrect Password" };
            return data;
        }
    } else {
        const data = { status: 403, msg: "user does not exit" };
        return data;
    }
}

const forgotPassword = async (email) => {
    //console.log(email)
    const checkEmail = await User.findOne({ email }).exec();
    console.log(checkEmail);
    if (checkEmail) {

        var string = Math.random().toString(36).substr(2, 10);
        //console.log(string)

        const account = await nodemailer.createTestAccount();
        //console.log(account);
        const mailer = nodemailer.createTransport({
            name: 'gmail.com',
            host: "smtp.gmail.com",
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: {
                user: process.env.sender,
                pass: process.env.password
            }
        });

        let info = await mailer.sendMail({
            from: process.env.sender,
            to: checkEmail.email, // list of receivers
            subject: "Password Reset ✔", // Subject line
            text: "Password Reset Ramdom String",  // plain text body
            html: `<a href="http://localhost:4200/reset/${email}/${string}">Click on this link</a>`,
        });
        const updateString = await User.updateOne({ email: checkEmail.email }, {
            randomString: string
        });
        //console.log("update string random" + updateString);
        const data = { status: 200, msg: "Check your email and reset your password", updateString };
        return data
    } else {
        const data = { status: 403, msg: "user does not registered" };
        return data;
    }

}

const verfiyString = async (email, randomString) => {
    const checkUser = await User.findOne({ email: email, randomString: randomString }).exec();
    console.log(checkUser);
    if (checkUser) {
        const data = { status: 200, msg: "string verified" };
        return data;
    } else {
        const data = { status: 403, msg: "reset url is expired" };
        return data;
    }
}

const resetPassword = async (email, password) => {

    const hash = bcrypt.hashSync(password, saltRounds);
    const updateString = await User.updateOne({ email: email }, {
        password: hash
    });

    const data = { status: 200, msg: "password updated successfully", updateString };
    return data;
}

const expireString = async (email) => {


    const expire_string = await User.updateOne({ email: email }, {
        randomString: ""
    });

    const data = { status: 200, msg: "Random String is expired", expire_string };
    //console.log(data);
}

const activateAccount = async (email) => {

    const checkUser = await User.findOne({ email: email }).exec();
    console.log(checkUser.status);
    if (checkUser.status == false) {
        const activate = await User.updateOne({ email: email }, {
            status: true
        });
        const data = { status: 200, msg: "user account activated", activate };
        return data
    }
    else {
        const data = { status: 403, msg: "user already activated and check login" };
        return data;
    }

}

// const createShortUrl = (url, email, cb) => {

//     var shrt_url;
//     var urlsplit;
//     let newURL;
//     let data;
//     shortUrl.short(url,  async (err, urlLink) => {
//         shrt_url = urlLink;
//         console.log(shrt_url);
//         const split = shrt_url.split("/");
//         urlsplit = split[3];
//         console.log(urlsplit);
//         var clicks = 0;
//         newURL = await new urlShortner({ email, clicks, shortnerURL: shrt_url, shortner: urlsplit, url: url }).save();
//         data = { status: 200, msg: "created shortend url", newURL };
//         cb(null, data);
//     });


// }

const createShortUrl = async (url, email) => {
    let checkURL = await urlShort.findOne({ url, email }).exec();
    console.log(checkURL);
    return new Promise(function (resolve, reject) {
        shortUrl.short(url, (err, urlLink) => {
            if (err) {
                reject(err);
            } else {
                if (!checkURL) {
                    let shrt_url = urlLink;
                    console.log(shrt_url);
                    const split = shrt_url.split("/");
                    let urlsplit = split[3];
                    let clicks = 0;
                    let newURL = new urlShort({ email, clicks, shortnerURL: shrt_url, shortner: urlsplit, url: url }).save();
                    let data = { status: 200, msg: "created shortend url", newURL };
                    resolve(data);
                } else {
                    const data = { status: 409, msg: "shortner url already created" };
                    resolve(data);
                }
            }
        });
    })

}

const getShortUrl = async (email) => {
    const urlData = await urlShort.find({ email }).exec();
    console.log(urlData);
    return urlData;
}

const clickcount = async (email, url) => {
    console.log(url);
    console.log(email);
    let click_url = await urlShort.findOne().exec();
    console.log(click_url)
    if(click_url){
        let clicks = click_url.clicks + 1;
        console.log(clicks);
        const click_count = await urlShort.updateOne({ url: url }, {
            clicks: clicks
        });
        console.log(click_count);
        const data = { status: 200, msg: "click count updated successfully", click_count };
        return data;
    }else{
        const data = { status: 403, msg: "shortner url does not exit" };
        return data;
    }
}



module.exports = {
    getUser,
    registerUser,
    loginUser,
    forgotPassword,
    verfiyString,
    resetPassword,
    expireString,
    activateAccount,
    createShortUrl,
    getShortUrl,
    clickcount
}