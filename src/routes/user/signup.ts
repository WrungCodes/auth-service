import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@softpay/common';

import { User } from '../../models/user';
import { Token } from '../../models/token';
import mongoose from "mongoose";

const router = express.Router();

router.post(
    '/api/users/signup',
    [
        body('email').isEmail().withMessage('Email must be valid'),
        body('password')
            .isString()
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage('Password must be between 4 and 20 characters'),
    ],
    validateRequest,
    async (request: Request, response: Response) => {

        const { email, password } = request.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
          throw new BadRequestError('Email in use');
        }

        const user = User.build({ email, password, type: 'customer' });
        await user.save(); 

        const token = Token.build({ user: user.id, type: 'email-verfication' });
        await token.save();

        // raise `user:sigined-up` event here
        // this event will trigger the email service to send a welcome email to the user 
        // and will trigger the kyc service to send an email verification to the user

        // Generate JWT
        const userJwt = jwt.sign(
            {
                id: user.id,
                email: user.email,
                verified: user.verified,
                model: user.type,
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

        response.status(201).send(user);
    }
);

export { router as signupRouter };