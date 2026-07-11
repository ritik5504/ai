const express = require('express');
const router = express.Router();
const { analyzeCompany, getHistory, deleteReport } = require('../controllers/analyzeController');

router.post('/analyze', analyzeCompany);
router.get('/history', getHistory);
router.delete('/report/:id', deleteReport);

module.exports = router;
