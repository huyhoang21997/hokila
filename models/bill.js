var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cartProductSchema = new Schema({
    productId: {type: String, required: true},
    productName: {type: String, required: true},
    unitPrice: {type: Number, required: true, min: 0},
    count: {type: Number, required: true, min: 0},
    total_unit_price: {type: Number, required: true, min: 0}
});

var billSchema = new Schema({
    customer: {type: String, required: true},
    product: {type: [cartProductSchema], required: true},
    date: {type: Date, default: Date.now},
    state: {type: String, required: true},
    fullname: {type: String, required: true},
    phone: {type: String, required: true},
    address: {type: String, required: true},
    total_count: {type: Number, required: true},
    total_price: {type: Number, required: true},
    saler_name: {type: String},
    state: {type: String, enum: ['Not delivered', 'Delivering', 'Delivered']}
});

module.exports = mongoose.model('bill', billSchema);