import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@softpay/common';
import { Password } from "../../services/password";
import { User } from "../../models/user";

const router = express.Router();

router.post(
    '/api/users/signin',
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
        if (!existingUser) {
          throw new BadRequestError('Invalid credentials');
        }
    
        const passwordsMatch = await Password.compare(
          existingUser.password,
          password
        );
        if (!passwordsMatch) {
          throw new BadRequestError('Invalid Credentials');
        }
    
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

        // raise `user:logged-in` event here
    
        response.status(200).send(existingUser);
    }
);

export { router as signinRouter };