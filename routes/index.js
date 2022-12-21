const router = require('express').Router();

router.get('/', (req, res) => {
    console.log(req.headers)
    return res.render('index',);
}
);
router.get('/nda', (req, res) => {
    console.log(req.headers)
    return res.render('nda',);
}
);
router.get('/terms', (req, res) => {
    console.log(req.headers)
    return res.render('terms',);
}
);


module.exports.HOME = router;