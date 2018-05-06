'use strict';

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const express = require('express');
const router = express.Router();

const { ItemList } = require('./models');


Item.create(
    'boiled white rice', ['1 cup white rice', '2 cups water', 'pinch of salt']);
Item.create(
    'milkshake', ['2 tbsp cocoa', '2 cups vanilla ice cream', '1 cup milk']);


app.get('/items', (req, res) => {
    ItemList
        .find()
        // we're limiting because restaurants db has > 25,000
        // documents, and that's too much to process/return
        .limit(10)
        // success callback: for each restaurant we got back, we'll
        // call the `.serialize` instance method we've created in
        // models.js in order to only expose the data we want the API return.
        .then(items => {
            res.json({
                items: items.map(
                    (item) => item.serialize())
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        });
});


app.get('/items/:id', (req, res) => {
    ItemList
    // this is a convenience method Mongoose provides for searching
    // by the object _id property
        .findById(req.params.id)
        .then(item => res.json(item.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        });
});


app.post('/items', (req, res) => {

    const requiredFields = ['name', 'borough', 'cuisine'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    ItemList
        .create({
            name: req.body.name,
            borough: req.body.borough,
            cuisine: req.body.cuisine,
            grades: req.body.grades,
            address: req.body.address
        })
        .then(item => res.status(201).json(item.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        });
});


app.put('/items/:id', (req, res) => {
    // ensure that the id in the request path and the one in request body match
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (
            `Request path id (${req.params.id}) and request body id ` +
            `(${req.body.id}) must match`);
        console.error(message);
        return res.status(400).json({ message: message });
    }

    // we only support a subset of fields being updateable.
    // if the user sent over any of the updatableFields, we udpate those values
    // in document
    const updateItem = {};
    const updateableFields = ['name', 'borough', 'cuisine', 'address'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            updateItem[field] = req.body[field];
        }
    });

    ItemList
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
        .findByIdAndUpdate(req.params.id, { $set: updateItem })
        .then(item => res.status(204).end())
        .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

app.delete('/items/:id', (req, res) => {
    ItemList
        .findByIdAndRemove(req.params.id)
        .then(item => res.status(204).end())
        .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function(req, res) {
    res.status(404).json({ message: 'Not Found' });
});