var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var accountSchema = new Schema({
    email: {type: String, required: true, unique: true},
    username: {type: String, required: true, unique: true, min: 6, max: 30},
    password: {type: String, required: true, min: 8},
    role: {type: String, enum: ['Khachhang', 'Quanly']},
    firstname: {type: String},
    lastname: {type: String},
    phone: {type: String},
    address: {type: String}
    // birthday: {type: Date},
    //gender: {type: String}
});
module.exports = mongoose.model('account', accountSchema);