const express = require('express');
const authController = require('./../controllers/authController');
const genreController = require('./../controllers/genreController');

const router = express.Router();

router
  .route('/')
  .get(genreController.regexSearch, genreController.getAllGenres);
router.route('/:id').get(genreController.getGenre);

router.use(authController.protect);
router.use(authController.restrictTo('moderator', 'admin'));

router.route('/').post(genreController.createGenre);

router
  .route('/:id')
  .patch(genreController.uploadGenrePhoto, genreController.updateGenre)
  .delete(
    genreController.checkToDeleteGenre,
    genreController.deleteGenrePhoto,
    genreController.deleteGenre
  );

module.exports = router;
