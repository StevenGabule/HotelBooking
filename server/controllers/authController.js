import User from '../models/user';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name) {
      return res.status(400).send('Name is required!');
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .send('Password is required and should be min 6 characters long!');
    }
    let userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).send('Email is already taken!');
    }
    const user = new User(req.body);
    const newUser = await user.save();
    return res.json({ ok: true, user: newUser });
  } catch (error) {
    return res.status(400).send('Error:: ', error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email }).exec();
    if (!user) return res.status(400).send('User with that email not found!');
    user.comparePassword(password, (err, match) => {
      if (!match || err) {
        return res.status(400).send('Wrong password!');
      }
      let token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });
      res.json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          stripe_account_id: user.stripe_account_id,
          stripe_seller: user.stripe_seller,
          stripeSession: user.stripeSession,
        },
      });
    });
  } catch (error) {
    console.log('LOGIN ERROR:', error);
    return res.status(400).send(error);
  }
};
