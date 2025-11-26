"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const registrationGuard_middleware_1 = require("../middlewares/registrationGuard.middleware");
const rateLimiter_middleware_1 = require("../middlewares/rateLimiter.middleware");
const requireAuth_middleware_1 = require("../middlewares/requireAuth.middleware");
const login_controller_1 = require("../controllers/users/login.controller");
const getMe_controller_1 = require("../controllers/users/getMe.controller");
const signup_controller_1 = require("../controllers/users/signup.controller");
const userRouter = (0, express_1.Router)();
// Define your authentication routes here
userRouter.post('/login', rateLimiter_middleware_1.authRateLimiter, login_controller_1.login);
/*
    Register route
    - rate limiter
    - middleware to check if admin allow creation of new users
*/
userRouter.post('/register', rateLimiter_middleware_1.authRateLimiter, registrationGuard_middleware_1.checkRegistrationAllowed, signup_controller_1.register);
/**
    Get me route
 */
userRouter.get('/me', requireAuth_middleware_1.requireAuth, getMe_controller_1.getMe);
exports.default = userRouter;
