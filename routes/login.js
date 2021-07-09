var express = require('express');
var router = express.Router();
var JWT = require('jsonwebtoken');

const { getUser, registerUser, loginUser, forgotPassword, expireString, verfiyString, resetPassword, getShortUrl, activateAccount, createShortUrl, clickcount} = require("../controller/login");

const { authentication } = require("../middleware/auth");

/* GET users listing. */
router.get('/', async (req, res) => {
  try {
    const loginData = await getUser();
    res.status(200).json(loginData)
  } catch (error) {
    console.log(error);
    res.statusCode(500);
  }
});

router.post('/register',  async(req, res) => {
  try {
    const { firstname,lastname, email, password } =  req.body
    const response = await registerUser(firstname,lastname, email, password);
    res.status(response.status).json(response.msg);
  } catch (error) {
    console.log(error);
    res.statusCode(500);
  }
})

router.post('/login', async(req, res) => {
    try {
      const { email, password } = req.body;
      const response =  await loginUser(email, password);
      res.status(response.status).json(response);
    } catch (error) {
      console.log(error);
      res.statusCode(500);
    }
})

router.post('/forgot', async(req, res) => {
  try {
    const {email} = req.body;
    const response = await forgotPassword(email);
    res.status(response.status).json(response.msg);
    setTimeout(expireString, 30000, email);
  } catch (error) {
    console.log(error);
    res.statusCode(500);
  }
})

router.post('/verifyString', async(req, res) => {
  try {
    const {email, randomString} = req.body;
    const response = await verfiyString(email, randomString);
    res.status(response.status).json(response.msg);
  } catch (error) {
    console.log(error);
    res.statusCode(500);
  }
})

router.put('/reset', async(req, res) => {
  try {
    const {email, password} = req.body;
    const response = await resetPassword(email, password);
    res.status(response.status).json(response.msg);
  } catch (error) {
    console.log(error);
    res.statusCode(500);
  }
})

router.put('/userActivate', async(req, res) => {
  try {
    const {email} = req.body;
    const response = await activateAccount(email);
    res.status(response.status).json(response.msg);
  } catch (error) {
    console.log(error);
    res.statusCode(500);
  }
})

// router.post('/urlShort', async(req, res) => {
//   try {
//     const {url, email} = req.body;
//     createShortUrl(url, email,(e, response) =>{
//       res.status(response.status).json(response.msg);
//     });
    
//   } catch (error) {
//     console.log(error);
//     res.statusCode(500);
//   }
// })

router.post('/urlShort', async(req, res) => {
  try {
    const {url, email} = req.body;
    const response = await createShortUrl(url, email);
    res.status(response.status).json(response.msg);
  } catch (error) {
    console.log(error);
    res.statusCode(500);
  }
})

router.post('/clickUser', async(req, res) => {
  try {
    const {url, email} = req.body;
    const response = await clickcount(url, email);
    res.status(response.status).json(response.msg);
  } catch (error) {
    console.log(error);
    res.statusCode(500);
  }
})

router.post('/getUrlShort', async(req, res) => {
  try {
    const {email} = req.body;
    const response = await getShortUrl(email);
    res.status(200).json(response)
  } catch (error) {
    console.log(error);
    res.statusCode(500);
  }
})

module.exports = router;
