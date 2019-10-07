const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require('../authenticate')

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req,res,next) => {
    res.end('Will send all the promotions to you!');
})
.post(authenticate.verifyUser, (req, res, next) => {
    res.end('Will add the promotion: ' + req.body.name + ' with details: ' + req.body.description);
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
})
.delete(authenticate.verifyUser, (req, res, next) => {
    res.end('Deleting all promotion');
});

promoRouter.route("/:promoId")
.all((req, res, next)=>{
    res.statusCode=200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next)=>{
    res.send("Will send details of the promotion: " + req.params.promoId + " to you!");
})
.post(authenticate.verifyUser, (req, res, next)=>{
    res.statusCode=403;
    res.end("Operation not supported on /promotion/" + req.params.dishId);
})
.put(authenticate.verifyUser, (req, res, next)=>{
    res.end("Updating the promotion: " + req.params.promoId + "\n" + "Will update the promotion: " + req.body.name +
    " with details: " + req.body.description);
})
.delete(authenticate.verifyUser, (req, res, next)=>{
    res.send("Deleting promotion: " + req.params.promoId);
});

module.exports = promoRouter;
