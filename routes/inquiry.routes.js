const router = require('express').Router();
const { getInquiries, createInquiry, updateInquiryStatus, deleteInquiry } = require('../controllers/inquiry.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/',       verifyToken, getInquiries);
router.post('/',      createInquiry);
router.put('/:id',    verifyToken, updateInquiryStatus);
router.delete('/:id', verifyToken, deleteInquiry);

module.exports = router;
