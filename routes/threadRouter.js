const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Threads = require("../models/threads");

const authenticate = require('../authenticate')

const threadRouter = express.Router();

threadRouter.use(bodyParser.json());

threadRouter.route('/')
.get((req,res,next) => {
    Threads.find({})
    .populate("comments.author")
    .then((thread)=>{
        res.statusCode=200;
        res.setHeader("Content-Type", "application/json");
        res.json(thread);
    }, (err)=>next(err))
    .catch((err)=>next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Threads.create(req.body)
    .then((thread)=>{
        console.log("Thread Created", thread);
        res.statusCode=200;
        res.setHeader("Content-Type", "application/json");
        res.json(thread);
    }, (err)=>next(err))
    .catch((err)=>next(err));
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /threads');
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Threads.remove({})
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader("Content-Type", "application/json");
        res.json(resp);
    }, (err)=>next(err))
    .catch((err)=>next(err));
})

threadRouter.route("/:threadId")
.get((req, res, next)=>{
    Threads.findById(req.params.threadId)
    .populate("comments.author")
        .then((thread)=>{
            console.log("Thread Created", thread);
            res.statusCode=200;
            res.setHeader("Content-Type", "application/json");
            res.json(thread);
        }, (err)=>next(err))
        .catch((err)=>next(err));
 })

.post(authenticate.verifyUser, (req, res, next)=>{
    res.statusCode=403;
    res.end("Operation not supported on /threads/" + req.params.threadId);
})
.put(authenticate.verifyUser, (req, res, next)=>{
    Threads.findOneAndUpdate(req.params.threadId, {
        $set: req.body
    },{new: true})
        .then((thread)=>{
            res.statusCode=200;
            res.setHeader("Content-Type", "application/json");
            res.json(thread);
        }, (err)=>next(err))
        .catch((err)=>next(err));
})
.delete(authenticate.verifyUser, (req, res, next)=>{
    Threads.findByIdAndRemove(req.params.threadId)
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader("Content-Type", "application/json");
        res.json(resp);
    }, (err)=>next(err))
    .catch((err)=>next(err));
});

// comments
threadRouter.route('/:threadId/comments')
.get((req, res, next) => {
    Threads.findById(req.params.threadId)
    .populate("comments.author")
    .then((thread) => {
        if(thread != null) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(thread.comments)
        }
        else {
            err = new Error('Thread ' + req.params.threadId + ' not found')
            err.status = 404
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(authenticate.verifyUser, (req, res, next) => {
    Threads.findById(req.params.threadId)
    .then((thread) => {
        if(thread != null) {
            req.body.author = req.user._id
            thread.comments.push(req.body)
            thread.save()
            .then((thread) => {
                Threads.findById(thread._id)
                    .populate("comments.author")
                    .then((thread) => {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json')
                        res.json(thread.comments)
                    })
            }, (err) => { next(err) })
        }
        else {
            err = new Error('Thread ' + req.params.threadId + ' not found')
            err.status = 404
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /threads/' + req.params.threadId + '/comments')
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Threads.findById(req.params.threadId)
    .then((resp) => {
        if(thread != null) {
            for(var i = (thread.comments.length - 1); i >= 0; i--) {
                thread.comments.id(thread.comments[i]._id).remove()
            }
            thread.save()
            .then((thread) => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(thread.comments)
            }, (err) => { next(err) })
        }
        else {
            err = new Error('Thread ' + req.params.threadId + ' not found')
            err.status = 404
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})

threadRouter.route('/:threadId/comments/:commentId')
.get((req, res, next) => {
    Threads.findById(req.params.threadId)
    .populate("comments.author")
    .then((thread) => {
        if(thread != null && thread.comments.id(req.params.commentId) != null) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(thread.comments.id(req.params.commentId))
        }
        else if(thread == null){
            err = new Error('Thread ' + req.params.threadId + ' not found')
            err.status = 404
            return next(err)
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found')
            err.status = 404
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403
    res.end('POST operation not supported on /threads/' + req.params.threadId + '/comments/' + req.params.commentId)
})
.put(authenticate.verifyUser, (req, res, next) => {
    Threads.findById(req.params.threadId)
    .then((thread) => {
        if(thread != null && thread.comments.id(req.params.commentId) != null) {
            // if(req.body.rating) {
            //     thread.comments.id(req.params.commentId).rating = req.body.rating
            // }
            if(req.body.comment) {
                thread.comments.id(req.params.commentId).comment = req.body.comment
            }
            thread.save()
            .then((thread) => {
                Threads.findById(thread._id)
                .populate("comments.author")
                .then((thread) => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(thread.comments)
                })
            }, (err) => { next(err) })
        }
        else if(thread == null){
            err = new Error('Thread ' + req.params.threadId + ' not found')
            err.status = 404
            return next(err)
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found')
            err.status = 404
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Threads.findById(req.params.threadId)
    .then((thread) => {
        if(thread != null && thread.comments.id(req.params.commentId) != null) {
            thread.comments.id(req.params.commentId).remove()
            thread.save()
            .then((thread) => {
                Threads.findById(thread._id)
                .populate("comments.author")
                .then((thread) => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(thread.comments)
                })
            }, (err) => { next(err) })
        }
        else if(thread == null){
            err = new Error('Thread ' + req.params.threadId + ' not found')
            err.status = 404
            return next(err)
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found')
            err.status = 404
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})

module.exports =threadRouter;
