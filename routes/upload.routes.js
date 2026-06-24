const router = require('express').Router();
const { uploadImage } = require('../controllers/upload.controller');
const { upload } = require('../middleware/upload.middleware');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/', verifyToken, upload.single('file'), uploadImage);

module.exports = router;
