import { Router } from 'express';
import { checkRegistrationAllowed } from '../middlewares/registrationGuard.middleware';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware';
import { requireAuth } from '../middlewares/requireAuth.middleware';
import { login } from '../controllers/users/login.controller';
import { getMe } from '../controllers/users/getMe.controller';
import { register } from '../controllers/users/signup.controller';



const userRouter = Router();

// Define your authentication routes here
userRouter.post('/login', authRateLimiter, login);



/* 
    Register route
    - rate limiter
    - middleware to check if admin allow creation of new users
*/
userRouter.post('/register', authRateLimiter, checkRegistrationAllowed, register);


/**
    Get me route
 */
userRouter.get('/me', requireAuth, getMe);

export default userRouter;