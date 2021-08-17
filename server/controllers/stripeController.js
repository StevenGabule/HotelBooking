import User from '../models/user';
import Hotel from '../models/hotel';

import queryString from 'query-string';

const stripe = require('stripe')(process.env.STRIPE_SECRET);

export const create_account = async (req, res) => {
  const user = await User.findById(req.user._id).exec();
  if (!user.stripe_account_id) {
    const account = await stripe.accounts.create({
      type: 'express',
    });
    user.stripe_account_id = account.id;
    user.save();
  }

  let accountLink = await stripe.accountLinks.create({
    account: user.stripe_account_id,
    refresh_url: process.env.STRIPE_REDIRECT_URL,
    return_url: process.env.STRIPE_REDIRECT_URL,
    type: 'account_onboarding',
  });
  accountLink = Object.assign(accountLink, {
    'stripe_user[email]': user.email || undefined,
  });

  // console.log('ACCOUNT_LINK::', accountLink);

  let link = `${accountLink.url}?${queryString.stringify(accountLink)}`;
  return res.send(link);
};

const updateDelayDays = async (accountId) => {
  const account = await stripe.accounts.update(accountId, {
    payout_schedule: {
      delay_days: 7,
    },
  });
  return account;
};

export const status_account = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).exec();
    const account = await stripe.accounts.retrieve(user.stripe_account_id);

    const updatedAccount = await updateDelayDays(account.id);
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        stripe_seller: updatedAccount,
      },
      { new: true }
    )
      .select('-password')
      .exec();
    // console.log(updatedUser);
    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
};

export const get_account_balance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).exec();
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripe_account_id,
    });
    res.json(balance);
  } catch (error) {
    console.log(error.message);
    return res.status(400).send(error.message);
  }
};

export const get_payout_setting = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).exec();
    const loginLink = await stripe.accounts.createLoginLink(
      user.stripe_account_id,
      {
        redirect_url: process.env.STRIPE_SETTING_REDIRECT_URL,
      }
    );
    console.log(loginLink);
    res.json(loginLink);
  } catch (error) {
    console.log(error.message);
    return res.status(400).send(error.message);
  }
};

export const get_stripe_session_id = async (req, res) => {
  const { hotelId } = req.body;
  const item = await Hotel.findById(hotelId).populate('postedBy').exec();
  const fee = (item.price * 20) / 100;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        name: item.title,
        amount: item.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: fee * 100,
      transfer_data: {
        destination: item.postedBy.stripe_account_id,
      },
    },
    success_url: process.env.STRIPE_SUCCESS_URL,
    cancel_url: process.env.STRIPE_CANCEL_URL,
  });
  await User.findByIdAndUpdate(
    req.user._id,
    { stripeSession: session },
    { new: true }
  ).exec();
  res.send({
    sessionId: session.id,
  });
};
