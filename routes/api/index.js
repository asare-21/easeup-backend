const router = require('express').Router();

router.get('/', (req, res) => {
    console.log(req.headers)
    return res.render('soon',);
}
);
router.get('/policy', (req, res) => {
    console.log(req.headers)
    return res.render('policy',);
}
);
router.get('/terms', (req, res) => {
    console.log(req.headers)
    return res.render('terms',);
}
);


module.exports.HOME = router;