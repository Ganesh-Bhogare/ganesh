const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

// GET /login
exports.getLogin = (req, res) => {
    res.render("auth/login", {
        pageTitle: "Login",
        currentPage: "login",
        isLoggedIn: false,
        user: {},
        errors: [],
        oldInput: { email: '', password: '' }
    });
};

// GET /signup
exports.getSignUp = (req, res) => {
    res.render("auth/signUp", {
        pageTitle: "Signup",
        currentPage: "signup",
        isLoggedIn: false,
        user: {},
        errors: [],
        oldInput: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            userType: '',
            terms: false
        }
    });
};

// POST /signup
exports.postSignUp = [
    check('firstName')
        .notEmpty().withMessage('First Name is required')
        .isLength({ min: 3 }).withMessage('First Name must be at least 3 characters long')
        .matches(/^[a-zA-Z]+$/).withMessage('First Name must contain only letters'),

    check('lastName')
        .notEmpty().withMessage('Last Name is required')
        .matches(/^[a-zA-Z]+$/).withMessage('Last Name must contain only letters'),

    check('email')
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail(),

    check('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase and a number'),

    check('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),

    check('userType')
        .notEmpty().withMessage('User Type is required')
        .isIn(['host', 'guest']).withMessage('User Type must be either host or guest'),

    check('terms')
        .custom(value => {
            if (value !== 'on') {
                throw new Error('You must accept the terms and conditions');
            }
            return true;
        }),

    (req, res) => {
        const errors = validationResult(req);
        const { firstName, lastName, email, password, confirmPassword, userType, terms } = req.body;

        if (!errors.isEmpty()) {
            return res.status(422).render("auth/signUp", {
                pageTitle: "Signup",
                currentPage: "signup",
                user: {},
                isLoggedIn: false,
                errors: errors.array().map(e => e.msg),
                oldInput: { firstName, lastName, email, password, confirmPassword, userType, terms }
            });
        }

        bcrypt.hash(password, 12)
            .then(hashedPassword => {
                const user = new User({
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    userType
                });

                return user.save();
            })
            .then(() => {
                res.redirect("/login");
            })
            .catch(err => {
                return res.status(500).render("auth/signUp", {
                    pageTitle: "Signup",
                    currentPage: "signup",
                    isLoggedIn: false,
                    user: {},
                    errors: [err.message],
                    oldInput: { firstName, lastName, email, password, confirmPassword, userType, terms }
                });
            });
    }
];

// POST /login
exports.postLogin = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(422).render("auth/login", {
            pageTitle: "Login",
            currentPage: "login",
            isLoggedIn: false,
            user: {},
            errors: ["User does not found"],
            oldInput: { email }
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(422).render("auth/login", {
            pageTitle: "Login",
            currentPage: "login",
            isLoggedIn: false,
            user: {},
            errors: ["Invalid password"],
            oldInput: { email }
        });
    }

    req.session.isLoggedIn = true;
    req.session.user = user;
    await req.session.save();
    res.redirect('/');
};

// POST /logout
exports.postLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
};
