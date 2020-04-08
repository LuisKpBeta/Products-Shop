const router = require("express").Router();
const shopController = require("../controllers/shop");
const isAuth = require("../middlware/isAuth");
router.get("/", shopController.getIndex);
router.get("/products", shopController.getProducts);
router.get("/products/:productId", shopController.getProduct);

router.get("/cart", isAuth, shopController.getCart);
router.post("/cart", isAuth, shopController.postCart);
router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);

router.get("/checkout", isAuth, shopController.getCheckOut);
router.get("/checkout/success", isAuth, shopController.getCheckOutSucess);
router.get("/checkout/cancel", isAuth, shopController.getCheckOut);

router.get("/orders", isAuth, shopController.getOrders);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);
module.exports = router;
