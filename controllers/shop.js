const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const ITEMS_PER_PAGE = 4;
exports.getProducts = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const total = await Product.find().countDocuments();
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
      currentPage: page,
      total,
      hasNext: ITEMS_PER_PAGE * page < total,
      hasPrevious: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(total / ITEMS_PER_PAGE),
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
      path: "/products",
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
  }
};
exports.getIndex = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const total = await Product.find().countDocuments();
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      currentPage: page,
      total,
      hasNext: ITEMS_PER_PAGE * page < total,
      hasPrevious: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(total / ITEMS_PER_PAGE),
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
      products,
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
    const cartItems = user.cart.items.map((item) => {
      return { quantity: item.quantity, product: item.productId };
    });
    const order = new Order({
      userId: req.user,
      products: cartItems,
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
      orders: orders,
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
  }
};
exports.getInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("products.product");
    if (!order) {
      const error = new Error("No order founded");
      error.status = 400;
      throw error;
    }
    if (order.userId.toString() !== req.user._id.toString()) {
      const error = new Error("Not authorized");
      error.status = 401;
      throw error;
    }
    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicepath = path.join("invoices", invoiceName);
    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(fs.createWriteStream(invoicepath));

    pdfDoc.fontSize(26).text("Invoice");
    pdfDoc.text("\n");
    let totalPrice = 0;
    order.products.forEach((item) => {
      totalPrice += item.quantity * item.product.price;
      pdfDoc.text(
        item.product.title + ":" + item.quantity + " x $" + item.product.price
      );
    });
    pdfDoc.text("\n");
    pdfDoc.text("Total: $" + totalPrice);
    pdfDoc.end();
    pdfDoc.pipe(res);

    // res.setHeader("Content-Type", "application/pdf");
    // res.setHeader(
    //   "Content-Disposition",
    //   'inline; filename="' + invoiceName + '"'
    // );
    // file.pipe(res);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
