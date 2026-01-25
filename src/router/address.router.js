const {Router} = require("express");

const addressRouter = Router();

const validationMiddlewares = require("../middlewares/validation.middleware");
const addressSchema = require("../validations/address.schema")

const addressController = require("../controllers/address.controller")

addressRouter.get("/", addressController.getUserAddressesController);
addressRouter.get("/default", addressController.getDefaultAddressController);
addressRouter.post("/", validationMiddlewares.validateBody(addressSchema), addressController.addAddressController);
addressRouter.patch("/:id", validationMiddlewares.validateBody(addressSchema), addressController.updateAddressController);
addressRouter.delete("/:id", addressController.deleteAddressController);

module.exports = addressRouter;
