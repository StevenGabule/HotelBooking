import Hotel from '../models/hotel';
import fs from 'fs';
export const create = async (req, res) => {
  try {
    // console.log('REQ.FIELDS', req.fields);
    // console.log('REQ.FILES', req.files);
    let fields = req.fields;
    let files = req.files;

    let hotel = new Hotel(fields);
    hotel.postedBy = req.user._id;
    if (files.image) {
      hotel.image.data = fs.readFileSync(files.image.path);
      hotel.image.contentType = files.image.type;
    }
    hotel.save((err, result) => {
      if (err) {
        console.log(err);
        return res.status(400).send('Something goes wrong!');
      }
      res.json(result);
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      err: error.message,
    });
  }
};

export const index = async (req, res) => {
  try {
    let hotels = await Hotel.find({})
      .limit(24)
      .select('-image.data')
      .populate('postedBy', '_id name')
      .exec();
    return res.json(hotels);
  } catch (err) {
    console.log(err.message);
    return res.status(400).send('Something goes wrong!');
  }
};

export const showImage = async (req, res) => {
  let hotel = await Hotel.findById(req.params.hotelId).exec();
  if (hotel && hotel.image && hotel.image.data !== null) {
    res.set('Content-Type', hotel.image.contentType);
    return res.send(hotel.image.data);
  }
};

export const sellerHotels = async (req, res) => {
  try {
    let hotels = await Hotel.find({ postedBy: req.user._id })
      .select('-image.data')
      .populate('postedBy', '_id name')
      .exec();
    return res.json(hotels);
  } catch (error) {
    console.log(error.message);
    return res.status(400).send('Something goes wrong!');
  }
};

export const removeHotel = async (req, res) => {
  try {
    let removed = await Hotel.findByIdAndDelete(req.params.hotelId).exec();
    res.json(removed);
  } catch (error) {
    console.log(error);
    return res.status(400).send('Something goes wrong!');
  }
};

export const showHotel = async (req, res) => {
  try {
    let hotel = await Hotel.findById(req.params.hotelId)
      .populate('postedBy', '_id name')
      .select('-image.data')
      .exec();
    return res.json(hotel);
  } catch (error) {
    console.log(error);
    return res.status(400).send('Something goes wrong!');
  }
};

export const updateHotel = async (req, res) => {
  try {
    let fields = req.fields;
    let files = req.files;

    let data = { ...fields };

    if (files.image) {
      let image = {};
      image.data = fs.readFileSync(files.image.path);
      image.contentType = files.image.type;

      data.image = image;
    }
    let updated = await Hotel.findByIdAndUpdate(req.params.hotelId, data, {
      new: true,
    }).select('-image.data');
    res.json(updated);
  } catch (error) {
    console.log(error);
    res.status(400).send('Hotel update failed, Try again!');
  }
};
