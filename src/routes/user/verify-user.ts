import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@softpay/common';

import { User } from '../../models/user';
import { Token } from '../../models/token';
import mongoose from "mongoose";

const router = express.Router();

router.post(
    '/api/users/verify',
    [
        body('user').isString(),
        body('token')
            .isString()
            .isLength({ min: 8, max: 8 }),
    ],
    validateRequest,
    async (request: Request, response: Response) => {

        const { user, token } = request.body;

        const existingUser = await User.findOne({ _id: user });

        if (!existingUser) {
          throw new BadRequestError('Invalid User');
        }

        if (existingUser.verified) {
            throw new BadRequestError('User already verified');
        }

        const existingToken = await Token.findOne({ user: user, token: token, type: 'email-verfication' });

        if (!existingToken) {
            throw new BadRequestError('Invalid Token');
        }

        // check if token is used
        if (existingToken.used) {
            throw new BadRequestError('Token already used');
        }

        // check if token is expired
        const now = new Date();
        const expiresAt = new Date(existingToken.createdAt);
        expiresAt.setHours(expiresAt.getHours() + 0, expiresAt.getMinutes() + 20);
        if (now > expiresAt) {
            throw new BadRequestError('Token expired');
        }

        // mark token as used
        existingToken.used = true;
        await existingToken.save();

        // mark user as verified
        existingUser.verified = true;
        await existingUser.save();

        // Generate JWT
        const userJwt = jwt.sign(
            {
                id: existingUser.id,
                email: existingUser.email,
                verified: existingUser.verified,
                model: existingUser.type,
            },
            process.env.JWT_KEY!,
            {
                expiresIn: '2h',
            }
        );
    
        // Store it on session object
        request.session = {
            jwt: userJwt,
        };

        // raise `user:verified-email` event here

        response.status(200).send(existingUser);
    }
);

export { router as verifyUserRouter };