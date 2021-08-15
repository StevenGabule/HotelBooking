import expressJwt from 'express-jwt';

export const requiresSignIn = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
});
