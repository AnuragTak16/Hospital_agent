const express = require('express');
const router = express.Router();

router.get('/admin', (req, res) => {
  res.send('Admin route');
});

module.exports = router;
