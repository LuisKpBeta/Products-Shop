const Product = require("../models/product");
const { validationResult } = require("express-validator");
const fileHelper = require("../util/file");
exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    error: null,
    product: { title: "", imageUrl: "", price: "", description: "" },
    fields: [],
  });
};
exports.postAddProduct = async (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file;
  try {
    if (!image) {
      return res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        error: "Attached file is not an image",
        product: { title, price, description },
        fields: [],
      });
    }
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      const fields = errors.array().map((err) => {
        return err.param;
      });
      return res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        error: errors.array()[0].msg,
        product: { title, imageUrl, price, description },
        fields,
      });
    }
    const imageUrl = image.path;
    console.log(image);
    const product = new Product({
      title,
      price,
      description,
      imageUrl,
      userId: req.user._id,
    });
    await product.save();
    res.redirect("/admin/products");
  } catch (error) {
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
  }
};
exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  const prodId = req.params.productId;
  if (!editMode) {
    return res.redirect("/");
  }
  try {
    let product = await Product.findById(prodId);
    if (!product) {
      res.redirect("/admin/products");
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
      error: null,
      fields: [],
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
  }
};
exports.postEditProduct = async (req, res, next) => {
  const { productId, title, price, description } = req.body;
  const image = req.file;
  try {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      const fields = errors.array().map((err) => {
        return err.param;
      });
      return res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: true,
        error: errors.array()[0].msg,
        product: { _id: productId, title, price, description },
        fields,
      });
    }
    const product = await Product.findById(productId);
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }
    if (image) {
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    product.title = title;
    product.price = price;
    product.description = description;
    await product.save();
    res.redirect("/admin/products");
  } catch (error) {
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
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
      path: "/admin/products",
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
  }
};
exports.postDeleteProduct = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    const product = await Product.findById(prodId).select("imageUrl");
    fileHelper.deleteFile(product.imageUrl);
    await Product.deleteOne({ _id: prodId, userId: req.user._id });
    res.redirect("/admin/products");
  } catch (error) {
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
  }
};
