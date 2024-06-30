const { check, body} = require('express-validator')
const {validatorMiddleware} = require("../../middlewares/validationMiddleWare")
const UserModel = require('../../models/userModel');



exports.signupValidator = [
    check('name')
    .isLength({ min: 3 })
    .withMessage('must be at least 3 chars')
    .notEmpty()
    .withMessage('User required'),
    
    check("email").notEmpty().withMessage("email Required")
    .isEmail().withMessage('must be Valid email')
    .custom((val) =>
    UserModel.findOne({ email: val }).then((user) => {
      if (user) {
        return Promise.reject("E-mail already in exists!");
      }
    })
  ),
    check("password").notEmpty().withMessage("password Required")
    .isLength({min:6}).withMessage("Password must be at least 6 characters").custom((password , {req})=>{
      if (password !== req.body.passwordConfirmation){
        throw {massage:"passwordConfirmation Is Wrong "}
      }
      return true;
    }),
    check("passwordConfirmation").notEmpty().withMessage("passwordConfirmation Required"),

  validatorMiddleware,
];


exports.loginValidator = [
  check("email").notEmpty().withMessage("email Required")
  .isEmail().withMessage('must be Valid email'),

  check("password").notEmpty().withMessage("password Required"),
validatorMiddleware,
];



