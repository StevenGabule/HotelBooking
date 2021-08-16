import express from 'express';
import formidable from 'express-formidable';
import { create, index, showImage } from '../controllers/hotelController';
import { requiresSignIn } from '../middleware';
const router = express.Router();

router.post('/create-hotel', requiresSignIn, formidable(), create);
router.get('/hotels', index);
router.get('/hotel/image/:hotelId', showImage);

module.exports = router;
