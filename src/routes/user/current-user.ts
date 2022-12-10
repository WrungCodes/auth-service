import express, { Request, Response } from 'express';
import { BadRequestError, currentUser } from '@softpay/common';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, async (request: Request, response: Response) => {
    response.send({ currentUser: request.currentUser || null});
});

export { router as currentUserRouter };