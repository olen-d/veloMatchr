const express = require("express");

const router = express.Router();

const authorizeJWT = require("../helpers/authorize-jwt");

const auth_controller = require("../controllers/authController");

router.post("/auth/token/grant-type/client-credentials", auth_controller.token_grant_type_client_credentials);
router.post("/auth/token/grant-type/password", auth_controller.token_grant_type_password);
router.post("/auth/token/grant-type/refresh-token", auth_controller.token_grant_type_refresh_token);

router.delete("/auth/token/refresh-token", authorizeJWT, auth_controller.refresh_token_delete);
router.delete("/auth/token/refresh-token/all/:userId", authorizeJWT, auth_controller.refresh_token_delete_all);

module.exports = router;
