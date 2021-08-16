import Hotel from '../models/hotel';
import fs from 'fs';
export const create = async (req, res) => {
  try {
    // console.log('REQ.FIELDS', req.fields);
    // console.log('REQ.FILES', req.files);
    let fields = req.fields;
    let files = req.files;

    let hotel = new Hotel(fields);
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
    console.log(hotels);
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
