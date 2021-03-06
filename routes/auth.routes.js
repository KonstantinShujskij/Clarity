const {Router} = require('express')
const {check, validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')
const passport = require('passport')
const userQueries = require('../queries/user.queries')


const router = Router()

router.get('/google', passport.authenticate('google', { session: false, scope: ['email'] }))

router.get('/google/redirect', passport.authenticate('google', { session: false }), (req, res) => {
    const user = req.user
    
    const token = jwt.sign({ userId: user._id }, config.get('jwtSecret'), { expiresIn: '1h' })
    res.redirect(`http://localhost:3000/window?token=${token}&id=${user._id}&isCompletely=${user.info}`)
})

router.post('/register',
    [
        check('email', 'Incorect email').isEmail(),
        check('password', 'Min password length is 8 symbols').isLength({min: 8}),
    ], 
    async (req, res) => {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), message: "Incorect data" })
        }

        const {email, password} = req.body
        const {user, error} = await userQueries.register(email, password)
        
        if(error) { return res.status(400).json({ message: error }) }

        const token = jwt.sign({ userId: user._id }, config.get('jwtSecret'), { expiresIn: '1h' })
        res.status(201).json({ token, userId: user._id, isCompletely: user.info })
    } catch(error) {
        res.status(500).json({ message: 'Что-то пошло не так...'})
    }
});

router.post('/login', 
    [
        check('email', 'Incorect email').isEmail(),
        check('password', 'Min password length is 8 symbols').isLength({min: 8})
    ],
    async (req, res) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), message: "Incorect data" })
        }
        
        const {email, password} = req.body;
        const {user, error} = await userQueries.login(email, password)

        if(error) { return res.status(400).json({ message: error }) }

        const token = jwt.sign({ userId: user._id }, config.get('jwtSecret'), { expiresIn: '1h' })
        res.json({ token, userId: user.id, isCompletely: user.info })

    } catch(error) {
        res.status(500).json({ message: 'Что-то пошло не так...'})
    }
});

module.exports = router;
