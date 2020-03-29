const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const order = new Schema({
  products: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});
module.exports = mongoose.model("Order", order);
