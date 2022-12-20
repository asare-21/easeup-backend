const router = require('express').Router();

router.get('/', (req, res) => {
    console.log(req.headers)
    return res.render('index',);
}
);


module.exports.HOME = router;