var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var accountSchema = new Schema({
    username: {type: String, required: true, unique: true, min: 6, max: 30},
    password: {type: String, required: true, min: 8},
    role: {type: String, enum: ['Khachhang', 'Nhanvien', 'Quanly']}
});
module.exports = mongoose.model('account', accountSchema);