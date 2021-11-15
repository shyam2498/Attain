'use strict'
require('dotenv').config()
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

app.use(express.json())

let postsOf = [
    {id:"33",post:"you are in post 33"},
    {id:"23",post:"you are in post 23"},
    {id:"3",post:"you are in post 3"},
    {id:"1",post:"you are in post 1"},
    {id:"2",post:"you are in post 2"},
    {id:"3",post:"you are in post 3"},
    {id:"4",post:"you are in post 4"},
    {id:"56",post:"you are in post 56"},
    {id:"6",post:"you are in post 6"},
    {id:"5",post:"you are in post 5"},
    {id:"7",post:"you are in post 7"},
    {id:"8",post:"you are in post 8"},
    {id:"9",post:"you are in post 9"},
    {id:"12",post:"you are in post 12"},
    {id:"13",post:"you are in post 13"}
    ]

app.get('/success', authenticateToken, (req, res) => {
    if(typeof req.user.name === 'string' && typeof req.user.pass === 'string'){
        
        res.send({message : "Successfully LoggedIn"})
    }
    else{
        res.send("Please Enter UserName and Password to LogIn")
    }
})

app.get('/students', authenticateToken, (req, res) => {
    const page = req.query.page;
    const pageSize = req.query.pageSize;

    let start = (page- 1)* pageSize;
    let end = page* pageSize;

    res.json(postsOf.slice(start, end));
});

app.put('/admin/:id', authenticateToken, (req, res) => {
    const Id = req.params.id;
    let body = req.body;
    let index= postsOf.findIndex(st => st.id === Id);
    let updatedIndex = {id:Id, ...body};

    postsOf[index] = updatedIndex;
    res.send(updatedIndex);
});

app.delete('/admin/:id', authenticateToken, (req, res) => {
    const Id = req.params.id;
    let index= postsOf.findIndex(st => st.id === Id);
    let deletedIndex = postsOf.splice(index,1);

    res.send(deletedIndex);
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.send({message : "No Token or Invalid Token"})

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err)
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

let newToken = []

app.post('/token', (req, res) => {
  const refreshToken = req.body.token
  if (refreshToken == null) return res.sendStatus(401)
  if (!newToken.includes(refreshToken)) return res.sendStatus(403)
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    const accessToken = getToken({ name: user.name })
    res.json({ accessToken: accessToken })
  })
})

app.delete('/logout', (req, res) => {
  newToken = newToken.filter(token => token !== req.body.token)
  res.sendStatus(204)
})

app.post('/login', (req, res) => {
  // Authenticate User

  const username = req.body.username
  const password = req.body.password
  const user = { name: username , pass : password}

  const accessToken = getToken(user)
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
  newToken.push(refreshToken)
  res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

function getToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '600s' })
}

app.listen(3000)