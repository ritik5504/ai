const express = require('express');
const router = express.Router();
const { analyzeCompany, getHistory, deleteReport, getMarketMovers } = require('../controllers/analyzeController');

router.post('/analyze', analyzeCompany);
router.get('/history', getHistory);
router.get('/market-movers', getMarketMovers);
router.delete('/report/:id', deleteReport);

module.exports = router;
