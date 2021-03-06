const {Router} = require('express')
const {check, validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')
const auth = require('../middleware/auth.middleware')
const file = require('../middleware/file.middleware')
const userQueries = require('../queries/user.queries')


const router = Router()

router.post('/set-info-client',
    file.none(),
    [
        check('phone', 'Incorect phone').isMobilePhone(),
        check('name', 'Min len of name is 3 symbols').isLength({min: 3}),
        check('whatsapp', 'Incorect whatchapp').optional({checkFalsy: true}).isMobilePhone()
    ], 
    auth,
    async (req, res) => {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), message: "Incorect data" })
        }

        const { name, telegram, instagram, facebook, whatsapp } = req.body

        const error = await userQueries.setInfo(req.user.userId, { name, telegram, instagram, 
            facebook, whatsapp, type: 'CLIENT' })

        if(error) { return res.status(400).json({ message: "Incorect data" }) }

        res.status(200).json({ edit: true })

    } catch(error) {
        res.status(500).json({ message: 'Что-то пошло не так...'})
    }
})

router.post('/set-info-master',
    file.array('images', 6),
    [
        check('phone', 'Incorect phone').isMobilePhone(),
        check('name', 'Min len of name is 3 symbols').isLength({min: 3}),
        check('cases', "Not select any categories").isArray().isIn(config.get('categories')),
        check('lat', 'Incorect position').isFloat(),
        check('lng', 'Incorect Position').isFloat(),
        check('whatsapp', 'Incorect whatchapp').optional({checkFalsy: true}).isMobilePhone()
    ], 
    auth,    
    async (req, res) => {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), message: "Incorect data" })
        }

        const {name, cases, lat, lng, telegram, instagram, facebook, whatsapp} = req.body
        const images = req.files.map((file) => file.filename)

        const error = await userQueries.setInfo(req.user.userId, { name, cases, lat, lng, telegram, 
            instagram, facebook, whatsapp, images, type: 'MASTER' })

        if(error) { return res.status(400).json({ message: "Incorect data" }) }

        res.status(200).json({ edit: true })

    } catch(error) {
        res.status(500).json({ message: 'Что-то пошло не так...'})
    }
})

module.exports = router;
