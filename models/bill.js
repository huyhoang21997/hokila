var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var billSchema = new Schema({
    product: {type: Schema.ObjectId, ref: 'product', required: true},
    date: {type: Date, default: Date.now},
    count: {type: Number, required: true, min: 0},
    unitprice: {type: Number, required: true, min: 0},
    state: {type: Boolean, required: true}
})
billSchema.virtual('total').get(function() {
    return this.count*this.unitprice;
});
module.exports = mongoose.model('bill', billSchema);