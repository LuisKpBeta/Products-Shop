const Product = require("../models/product");
const Order = require("../models/order");
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products"
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
  }
};
exports.getProduct = async (req, res, next) => {
  try {
    const prodId = req.params.productId;
    const product = await Product.findById(prodId);
    res.render("shop/product-detail", {
      product: product,
      pageTitle: product.title,
      path: "/products"
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
  }
};
exports.getIndex = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/"
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
  }
};
exports.getCart = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId").execPopulate();
    const products = user.cart.items;
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
  }
};
exports.postCart = async (req, res, next) => {
  const prodId = req.body.productId;
  try {
    const product = await Product.findById(prodId);
    await req.user.addToCart(product);
    res.redirect("/cart");
  } catch (error) {
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
  }
};
exports.postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  try {
    await req.user.deleteItemFromCart(prodId);
    res.redirect("/cart");
  } catch (error) {
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
  }
};
exports.postOrder = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId").execPopulate();
    const cartItems = user.cart.items.map(item => {
      return { quantity: item.quantity, product: item.productId };
    });
    const order = new Order({
      userId: req.user,
      products: cartItems
    });
    await order.save();
    await req.user.clearCart();
    res.redirect("/orders");
  } catch (error) {
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
  }
};
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("userId", "email")
      .populate("products.product");

    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: orders
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
  }
};
