var express = require('express');
var router = express.Router();
var db = require('../db/db')
const bcryptjs = require('bcryptjs');
var jwt = require("jsonwebtoken");
router.post('/loginserve', function (req, res, next) { //登录验证
  const info = req.body;
  var sqlstr = "select password from user where username=?";
  db.query(sqlstr, info.username, function (err, results) {
    try {
      const istrue = bcryptjs.compareSync(info.password, results[0].password)
      if (results.length === 0 || istrue === false) {
        res.send({
          status: 0,
          msg: "登录失败",
          data: {
            token: ' '
          }
        })
      }
      else {
        const isPwdValid = bcryptjs.compareSync(info.password, results[0].password)
        if (isPwdValid) {
          var token = jwt.sign(info, 'kongbai', { expiresIn: '2h' });
          res.send({
            status: 1,
            msg: "登录成功",
            data: {
              token: token
            }
          })
        }
      }
    }
    catch (error) {
      res.send({
        status: 0,
        msg: "登录失败捏",
        data: {
          token: ' '
        }
      })
    }

  })
})
router.post('/registerserve', function (req, res, next) {//注册用户
  const info = req.body;
  if (!info.username || !info.password)
    res.send('0')
  var sqlstr = 'select * from user where username = ?'   //用户名查重操作
  db.query(sqlstr, info.username, function (err, results) {
    if (err)
      res.send(err.message)
    if (results.length > 0) {
      res.send('1')
    }
    else {
      info.password = bcryptjs.hashSync(info.password, 10)
      const sql = 'insert into user set ?'
      db.query(sql, { username: info.username, password: info.password }, function (err, results) {
        if (err)
          res.send(err.message)
        if (results.affectedRows !== 1)
          res.send('-2')
        else {
          res.send('-1')
        }
      })
    }
  }
  )
});
router.post('/getusers', function (req, res, next) { //获取用户基本信息
  const sql = 'select * from user where username=?'
  var token = (req.headers.authorization || '').slice(7)
  // console.log(jwt.verify(token, 'kongbai').username);
  var username = jwt.verify(token, 'kongbai')
  try {
    console.log(username);
    db.query(sql, req.body.username, function (err, results) {
      if (err)
        res.send(err.message)
      else {
        res.send(results)
      }
    })
  } catch (error) {
    res.send({
      status: 401,
      msg: '请先登录'
    })
  }
})
router.post('/uploadvideo', function (req, res, next) { //上传视频
  var info = req.body
  const sql = 'insert into video set ?'
  db.query(sql, { videourl: info.videourl, username: info.username, introduce: info.introduce }, function (err, results) {
    if (err)
      res.send(err.message)
    // if (results.affectedRows !== 1) {

    //   res.send('-2')
    // }

    // res.send('-1')
  })
})
router.post('/uploadtype', function (req, res, next) {  //上传视频分类
  const info = req.body
  var sql = 'insert into videotype set ?'
  db.query(sql, { videourl: info.videourl, videotype: info.type }, (err, results) => {
    if (err)
      res.send(err.message)
    else {
      console.log(('666'));
    }
  })
})
router.get('/getvideo', function (req, res, next) {  //获取所有视频（主页）
  var sql = 'select * from video '
  db.query(sql, (err, results) => {
    if (err)
      res.send(err.message)
    else {
      res.send(results)
    }
  })
})
router.post('/getsidebar', function (req, res, next) {  //获取用户名在SideBar.vue中查找imgurl
  var info = req.body
  var sql = 'select username from video where videourl=?'
  db.query(sql, info.videourl, (err, results) => {
    if (err)
      res.send(err)
    else
      res.send(results)
  })
})
router.post('/getimgurl', function (req, res, next) {  //根据用户名查找imgurl
  var info = req.body
  var sql = 'select imgurl from user where username=?'
  db.query(sql, info.username, (err, results) => {
    if (err)
      res.send(err)
    else
      res.send(results)
  })
})
router.post('/setimgurl', function (req, res, next) {
  var info = req.body
  // var sql = "update user(imgurl) values('" + info.imgurl + "') where username=" + info.username + ""
  var sql = "update user set imgurl='" + info.imgurl + "' where username ='" + info.username + "'"
  db.query(sql, (err, results) => {
    if (err)
      console.log(err);
    else {
      res.send(results)
    }
  })
})
router.post('/updatestar', function (req, res, next) {  //更新积分
  var info = req.body
  var sql = "UPDATE user SET star =" + info.star + " where username='" + info.username + "'"
  // console.log(sql);
  db.query(sql, (err, results) => {
    if (err)
      res.send(err)
    else {
      res.send(results)
    }
  })
})
router.post('/getstar', function (req, res, next) {
  var sql = 'select star from user where username = "' + req.body.username + '"'
  db.query(sql, function (err, results) {
    if (err)
      res.send(err)
    else {
      res.send(results)
    }
  })
})
router.post('/deletevideo', function (req, res, next) {
  console.log(req);
  var sql = 'delete from video where videourl = "' + req.body.videourl + '"'
  db.query(sql, function (err, results) {
    if (err)
      res.send(err)
    else {
      res.send(results)
    }
  })
})
router.get('/sortstar', function (req, res, next) {
  var sql = 'select * from user order by star desc'
  db.query(sql, (err, results) => {
    if (err)
      res.send(err)
    else
      res.send(results)
  })
})
router.post('/selecttype', function (req, res, next) {  //获取视频分类
  var sql = "select videourl from videotype where videotype like '" + '%' + req.body.type + '%' + "'"
  db.query(sql, (err, results) => {
    if (err)
      console.log(err);
    else
      res.send(results)
  })
})
router.post('/submitcomment', function (req, res, next) {
  var info = req.body
  var sql = 'insert into videocomment set ?'
  db.query(sql, { videourl: info.videourl, videousername: info.videousername, videoimg: info.videoimg, videocomment: info.videocomment }, (err, results) => {
    if (err)
      res.send(err)
    else
      res.send(results)
  })
})
router.post('/getcomment', function (req, res, next) {
  var info = req.body
  var sql = "select * from videocomment where videourl='" + info.videourl + "'"
  db.query(sql, (err, results) => {
    if (err)
      console.log(err);
    else
      res.send(results)
  })


})
module.exports = router;
