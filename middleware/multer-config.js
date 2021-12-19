//Import of multer
const multer = require('multer');

//dictionary (object) for the file extension used in the filename
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
};

//Indicates to mult or save incoming files
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  //Filename tells multer to use the original name, replace spaces and add a timestamp
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  },
});

//export of multer with the single () method to manage only image files
module.exports = multer({ storage: storage }).single('image');
