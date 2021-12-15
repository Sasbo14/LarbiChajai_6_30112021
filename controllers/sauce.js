const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  //transformation des informations de la requête chaine JSON en objet
  const sauceObject = JSON.parse(req.body.sauce);
  //supprime l'id qui vient du front
  delete sauceObject._id;
  const sauce = new Sauce({
    //spread operator pour copier tous les éléments de req.body
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersDisliked: [],
    usersLiked: [],
  });

  //Vérifie si le userId de la sauce correspond à celui du token pour éviter que n'importe qui puisse créer des sauces à la place de quelqu'un d'autres
  if (sauce.userId === req.token.userId) {
    //sauvegarde la sauce dans la base de données
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
  } else {
    res
      .status(401)
      .json({ error: 'Vous ne pouvez pas créer de sauce avec cet userId' });
  }
};

//recupere une seul sauce
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
  //SauceObject vérifie si un fichier image existe déjà, si il existe on execute le code apres l'opérateur ternaire sion le code après les ":""
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  // Vérifie si l'utilisateur associé à la sauce est bien celui qui a envoyé la requête
  if (sauceObject.userId === req.token.userId) {
    //Méthode updateOne pour mettre à jour la sauce qui correspond à l'objet que l'on passe comme premier argument.
    Sauce.updateOne(
      //sauce à modifier
      { _id: req.params.id },
      //sauce modifier, on lui rajoute l'id qui correspond à celui des paramètres pour s'assurer d'avoir le même
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
  } else {
    res.status(401).json({
      error: 'Modification impossible, cette sauce ne vous appartient pas!',
    });
  }
};

//Suppression de la sauce
exports.deleteSauce = (req, res, next) => {
  //On récupère la sauce avec l'id qui correspond  à l'id des paramètres de la requête
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      //On s'assure que celui qui supprime la sauce est bien le propriétaire de la sauce
      //On compare donc le userId  avec le userId du token
      if (sauce.userId === req.token.userId) {
        const filename = sauce.imageUrl.split('/images/')[1];
        //méthode fs.unlink qui supprime l'image du dossier images
        fs.unlink(`images/${filename}`, () => {
          //suppression de la sauce de la base de données
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
      } else {
        res
          .status(401)
          .json({ error: 'Cette sauce ne vous appartient pas!!!' });
      }
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
