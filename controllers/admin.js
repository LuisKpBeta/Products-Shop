const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false
  });
};
exports.postAddProduct = async (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  try {
    const product = new Product({
      title,
      price,
      description,
      imageUrl,
      userId: req.user._id
    });
    await product.save();
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error);
  }
};
exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  try {
    const prodId = req.params.productId;
    const product = await Product.findById(prodId);
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product
    });
  } catch (error) {
    console.log(error);
  }
};
exports.postEditProduct = async (req, res, next) => {
  const { productId, title, price, imageUrl, description } = req.body;
  try {
    const product = await Product.findById(productId);
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }
    product.title = title;
    product.price = price;
    product.imageUrl = imageUrl;
    product.description = description;
    await product.save();
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error);
  }
};
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.user._id }).populate(
      "userId",
      "email"
    );
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products"
    });
  } catch (error) {
    console.log(error);
  }
};
exports.postDeleteProduct = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    await Product.deleteOne({ _id: prodId, userId: req.user._id });
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error);
  }
};
