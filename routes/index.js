const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', storeController.getStores);
router.get('/stores', storeController.getStores);
router.get('/add', authController.isLoggedIn, storeController.addStore);

router.post('/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);

router.post('/add/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);

//wild card route for pattern matching
//variable on request object will contain id for url
router.get('/stores/:id/edit', catchErrors(storeController.editStore))
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

router.get('/tags/', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/login', userController.loginForm);
router.post('/login', authController.login);

router.get('/register', userController.registerForm);

//validate the registration data
//register the user
//log in user
router.post('/register',
  userController.validateRegister,
  userController.register,
  authController.login)

router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount))
router.post('/account/forgot', catchErrors(authController.forgot))

module.exports = router;
