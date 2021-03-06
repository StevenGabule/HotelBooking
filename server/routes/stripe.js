import express from 'express';
import {
  create_account,
  status_account,
  get_account_balance,
  get_payout_setting,
  get_stripe_session_id,
} from '../controllers/stripeController';
import { requiresSignIn } from '../middleware';

const router = express.Router();

router.post('/create-connect-account', requiresSignIn, create_account);
router.post('/get-account-status', requiresSignIn, status_account);
router.post('/get-account-balance', requiresSignIn, get_account_balance);
router.post('/payout-setting', requiresSignIn, get_payout_setting);
router.post('/stripe-session-id', requiresSignIn, get_stripe_session_id);

module.exports = router;
