const router = require('express').Router();

router.get('/', (req, res) => {
    // res.sendFile('index.html');
    console.log(req.headers)
    return res.send('Hello World');
}
);


module.exports.HOME = router;