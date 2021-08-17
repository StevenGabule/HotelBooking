import express from 'express';
import formidable from 'express-formidable';
import {
  create,
  index,
  showImage,
  sellerHotels,
  removeHotel,
  showHotel,
  updateHotel,
} from '../controllers/hotelController';
import { hotelOwner, requiresSignIn } from '../middleware';
const router = express.Router();

router.post('/create-hotel', requiresSignIn, formidable(), create);
router.get('/hotels', index);
router.get('/hotel/image/:hotelId', showImage);
router.get('/seller-hotels', requiresSignIn, sellerHotels);

router.delete(
  '/delete-hotel/:hotelId',
  requiresSignIn,
  hotelOwner,
  removeHotel
);

router.get('/hotel/:hotelId', showHotel);
router.put(
  '/update-hotel/:hotelId',
  requiresSignIn,
  hotelOwner,
  formidable(),
  updateHotel
);

module.exports = router;
