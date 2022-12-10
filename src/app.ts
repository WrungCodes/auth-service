import express from 'express';
import { json } from 'body-parser'
import 'express-async-errors';
import { errorHandler, NotFoundError } from "@softpay/common";
import cookieSession from 'cookie-session';

import { currentUserRouter } from "./routes/user/current-user";
import { signinRouter } from "./routes/user/signin";
import { signoutRouter } from "./routes/user/signout";
import { signupRouter } from "./routes/user/signup";
import { verifyUserRouter } from "./routes/user/verify-user";
import { resendVerifyRouter } from "./routes/user/resend-verify";

const app = express();

app.set('trust proxy', true);

app.use(json());

app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
    })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);
app.use(verifyUserRouter);
app.use(resendVerifyRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});
  
app.use(errorHandler);

export { app };