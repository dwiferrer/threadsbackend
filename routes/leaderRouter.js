const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require('../authenticate')

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req,res,next) => {
    res.end('Will send all the leaders to you!');
})
.post(authenticate.verifyUser, (req, res, next) => {
    res.end('Will add the leader: ' + req.body.name + ' with details: ' + req.body.description);
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /leader');
})
.delete(authenticate.verifyUser, (req, res, next) => {
    res.end('Deleting all leaders');
});


leaderRouter.route("/:leaderId")
.all((req, res, next)=>{
    res.statusCode=200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next)=>{
    res.send("Will send details of the leader: " + req.params.leaderId + " to you!");
})
.post(authenticate.verifyUser, (req, res, next)=>{
    res.statusCode=403;
    res.end("Operation not supported on /leader/" + req.params.leaderId);
})
.put(authenticate.verifyUser, (req, res, next)=>{
    res.end("Updating the leader: " + req.params.leaderId + "\n" + "Will update the leader: " + req.body.name +
    " with details: " + req.body.description);
})
.delete(authenticate.verifyUser, (req, res, next)=>{
    res.send("Deleting leader: " + req.params.leaderId);
});

module.exports =leaderRouter;
