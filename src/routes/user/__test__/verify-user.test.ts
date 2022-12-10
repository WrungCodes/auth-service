import request from 'supertest';
import { app } from '../../../app';
import { Token } from "../../../models/token";

it('verify user account', async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
    .expect(201);

    // get the verification token from the database
    const existingToken = await Token.findOne({ user: response.body.id, type: 'email-verfication' });

    const newResponse = await request(app)
        .post('/api/users/verify')
        .send({
            user: response.body.id,
            token: existingToken?.token
        })
    .expect(200);

    expect(newResponse.body.verified).toEqual(true);

    expect(response.get('Set-Cookie')).toBeDefined();
});

// test for invalid token
it('verify user account with invalid token', async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
    .expect(201);

    // get the verification token from the database
    const existingToken = await Token.findOne({ user: response.body.id, type: 'email-verfication' });

    const newResponse = await request(app)
        .post('/api/users/verify')
        .send({
            user: response.body.id,
            token: existingToken?.token
        })
    .expect(200);
}); 

