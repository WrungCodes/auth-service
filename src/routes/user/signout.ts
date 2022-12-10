import express from 'express';

const router = express.Router();

router.post('/api/users/signout', (req, res) => {
    req.session = null;

    // raise `user:logged-out` event here

    res.send({});
});

export { router as signoutRouter };