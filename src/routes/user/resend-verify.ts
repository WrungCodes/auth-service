import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError, currentUser } from '@softpay/common';

import { User } from '../../models/user';
import { Token } from '../../models/token';
import mongoose from "mongoose";

const router = express.Router();


router.post('/api/users/resend', currentUser, async (request: Request, response: Response) => {
    const user = request.currentUser;

    if (!user) {
        throw new BadRequestError('Unauthorized');
    }

    // find user
    const existingUser = await User.findOne({ _id: user.id });

    // check if user exists
    if (!existingUser) {
        throw new BadRequestError('Invalid User');
    }

    // check if user is verified
    if (existingUser.verified) {
        throw new BadRequestError('User already verified');
    }

    // generate token
    const token = Token.build({ user: user.id, type: 'email-verfication' });
    await token.save();

    // raise `user:resend-verify`  event here
    // this event will trigger the email service to send a welcome email to the user 
    // and will trigger the kyc service to send an email verification to the user

    response.status(201).send(existingUser);
});

export { router as resendVerifyRouter };