var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    username: {type: String, required: true},
    content: {type: String, required: true},
    date: {type: Date, default: Date.now, required: true}
});

var productSchema = new Schema({
    productId: {type: String, required: true, unique: true},
    productName: {type: String, required: true},
    producer: {type: String, required: true},
    describe: {type: String, required: true},
    unitPrice: {type: Number, required: true, min: 0},
    count: {type: Number, required: true, min: 0},
    other: {type: Number},
    configuration: {
        screen: {type: String, required: true},
        camera: {type: String, required: true},
        pin: {type: String, required: true},
        ram: {type: String, required: true},
        cpu: {type: String, required: true},
        os: {type: String, required: true}
    },
    comment: {type: [commentSchema]}
});
// productSchema.virtual('imageFile').get(function() {
//     return this.productId + '_1.jpg';
// });
productSchema.virtual('state').get(function() {
    if (count == 0) {
        return 'Limited';
    }
    else {
        return null;
    }
});
module.exports = mongoose.model('product', productSchema);