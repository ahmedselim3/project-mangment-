const { check, body} = require('express-validator')
const {validatorMiddleware} = require("../../middlewares/validationMiddleWare")
const bcrypt = require('bcryptjs');
const UserModel = require('../../models/userModel');



exports.createUserValidator = [
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
 
exports.getUserValidator = [
    check('id').isMongoId().withMessage('Invalid User id format'),
    validatorMiddleware
];

exports.updateUserValidator = [
    check('id').isMongoId().withMessage('Invalid User id format'),
    check("email").optional()
    .isEmail().withMessage('must be Valid email')
    .custom((val) =>
    UserModel.findOne({ email: val }).then((user) => {
      if (user) {
        return Promise.reject("E-mail already in exists!");
      }
    })
  ),
    validatorMiddleware
];



exports.updateUserPassWordValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  body('currentPassword')
    .notEmpty()
    .withMessage('You must enter your current password'),
  body('passwordConfirmation')
    .notEmpty()
    .withMessage('You must enter the password confirm'),
  body('password')
    .notEmpty()
    .withMessage('You must enter new password')
    .custom(async (val, { req }) => {
      // 1) Verify current password
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        throw {massage:'There is no user for this id'};
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw {massage:'Incorrect current password'};
      }

      // 2) Verify password confirm
      if (val !== req.body.passwordConfirmation) {
        throw {massage:'Password Confirmation incorrect'};
      }
      return true;
    }),
  validatorMiddleware
  
];
exports.updateLoggedUserValidator = [
  body('name')
    .optional()
    .custom((val, { req }) => {
      return true;
    }),
  check('email')
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom((val) =>
      UserModel.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject('E-mail already in user');
        }
      })
    ),
  check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('Invalid phone number only accepted Egy and SA Phone numbers'),

  validatorMiddleware,
];

exports.deleteUserValidator = [
    check('id').isMongoId().withMessage('Invalid User id format'),
    validatorMiddleware
];
