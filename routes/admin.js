const router = require("express").Router();
const adminController = require("../controllers/admin");
const isAuth = require("../middlware/isAuth");
const { body } = require("express-validator");
//title, imageUrl, price, description
const productValidator = [
  body("title", "Title must be valid").trim().notEmpty().isLength({ min: 3 }),
  body("price", "Price must be valid").isFloat(),
  body("description", "Description must be valid (3-400 characters)")
    .trim()
    .isLength({ min: 3, max: 400 }),
];
router.get("/add-product", isAuth, adminController.getAddProduct);
router.get("/products", isAuth, adminController.getProducts);
router.post(
  "/add-product",
  isAuth,
  productValidator,
  adminController.postAddProduct
);
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);
router.post(
  "/edit-product",
  isAuth,
  productValidator,
  adminController.postEditProduct
);
router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
