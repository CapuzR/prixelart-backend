const multer  = require('multer');
const multerS3 = require('multer-s3-transform');
const aws = require('aws-sdk');
const dotenv = require('dotenv');
const sharp = require('sharp');
dotenv.config();
var path = require('path')

const spacesEndpoint = new aws.Endpoint(process.env.PRIVATE_BUCKET_URL);
const s3 = new aws.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DO_ACCESS_KEY,
    secretAccessKey: process.env.DO_ACCESS_SECRET
});

const uploadAvatarM = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.ASSET_BUCKET_NAME,
      acl: 'public-read',
      shouldTransform: function (req, file, cb) {
        cb(null, /^image/i.test(file.mimetype))
      },
      transforms: [{
        id: 'avatar',
        key: function (req, file, cb) {
          cb(null, req.user.id + '-avatar.webp')
        },
        transform: function (req, file, cb) {
          cb(null, sharp().resize({width: 300, fit: 'contain'}).webp({ quality: 100 }));
        }
      }
    ]
    })
  }).single('avatar');

  function avatarCb(request, res, next) {
    return function (error, response) {
      if (error) {
        console.log(error);
        return res.send(
          {
            success: false,
            message: 'Disculpa, ocurrió un error inesperado. Por favor inténtalo de nuevo.'
          }
        );
      } else {
        request.body.avatar = process.env.ASSET_BUCKET_URL + 
        '/' +
        request.user.id +
        '-avatar.webp';

        console.log('Avatar subido correctamente.');
        next();
      }
    };
  }

  const avatarUpload = (request, response, next)=> {
      uploadAvatarM(request, response, avatarCb(request, response, next));
  }

module.exports = { avatarUpload }
