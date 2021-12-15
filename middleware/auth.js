//import de jwt pour vérifier les tokens
const jwt = require('jsonwebtoken');
//variables d'environnements
require('dotenv').config();
const envdbToken = process.env.DB_TOKEN;

//middleware d'authenfication des routes sauce
module.exports = (req, res, next) => {
  try {
    //extraction du token du header authorization de la requête entrante, que l'on split pour séparer le token du bearer
    const token = req.headers.authorization.split(' ')[1];
    //enregistre le token decoder pour pouvoir le réutiliser
    req.token = jwt.verify(token, `${envdbToken}`);
    const userId = req.token.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw 'User ID non valable !';
    } else {
      next();
    }
  } catch (error) {
    res.status(401).json({ error: error | 'Requête non authentifiée !' });
  }
};
