var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var producerSchema = new Schema({
    name: {type: String, required: true, unique: true},
});

module.exports = mongoose.model('producer', producerSchema);