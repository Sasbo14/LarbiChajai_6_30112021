const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  //supprime l'id qui vient du front
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersDisliked: [],
    usersLiked: [],
  });
  sauce
    .save()
    .then(() => {
      res.status(201).json({
        message: 'Post saved successfully!',
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
  console.log(sauce);
};

exports.getOneSauce = (req, res, next) => {
  //Méthode findOne pour trouver la sauce unique ayant le même _id que le paramètre de la requête
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  //Méthode updateOne pour mettre à jour la sauce qui correspond à l'objet que l'on passe comme premier argument.
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => {
      res.status(200).json({
        message: 'Sauce updated successfully!',
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => {
            res.status(200).json({
              message: 'Sauce deleted',
            });
          })
          .catch((error) => {
            res.status(400).json({ error: error });
          });
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  //Méthode find qui renvoi un tableau avec toutes les sauces de la base de données.
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({ error: error });
    });
};

exports.likeSauce = (req, res, next) => {
  const like = req.body.like;
  switch (like) {
    case 1:
      Sauce.updateOne(
        { _id: req.params.id },
        {
          //incrémente un like
          $inc: { likes: +1 },
          //Ajoute l'id au tableau de like
          $push: { usersLiked: req.body.userId },
          _id: req.params.id,
        }
      )
        .then(() => res.status(200).json({ message: 'Vous aimez cette sauce' }))
        .catch((error) => res.status(400).json({ error }));
      break;

    case -1:
      Sauce.updateOne(
        { _id: req.params.id },
        {
          $inc: { dislikes: +1 },
          $push: { usersDisliked: req.body.userId },
          _id: req.params.id,
        }
      )
        .then(() =>
          res.status(200).json({ message: 'Vous détestez cette sauce' })
        )
        .catch((error) => res.status(400).json({ error }));
      break;

    case 0:
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          if (
            sauce.usersLiked.find(
              (user) => user === req.body.userId && req.body.like === 0
            )
          ) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: -1 },
                $pull: { usersLiked: req.body.userId },
                _id: req.params.id,
              }
            )
              .then(() =>
                res
                  .status(201)
                  .json({ message: 'Ton avis a été pris en compte!' })
              )
              .catch((error) => res.status(400).json({ error }));
          } else if (
            sauce.usersDisliked.find(
              (user) => user === req.body.userId && req.body.like === 0
            )
          ) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: req.body.userId },
                _id: req.params.id,
              }
            )
              .then(() =>
                res
                  .status(201)
                  .json({ message: 'Ton avis a été pris en compte!' })
              )
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => {
          res.status(400).json({ error });
        });
      break;
  }
};
