//import de jwt pour vérifier les tokens
const jwt = require('jsonwebtoken');
//environment variables
require('dotenv').config();
const envdbToken = process.env.DB_TOKEN;

//sauce route authentication middleware
module.exports = (req, res, next) => {
  try {
    //extraction of the token from the header authorization of the incoming request, which is split to separate the token from the bearer
    const token = req.headers.authorization.split(' ')[1];
    //saves the token decoder to be able to reuse it
    req.token = jwt.verify(token, `${envdbToken}`);
    const userId = req.token.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Invalid user ID';
    } else {
      next();
    }
  } catch (error) {
    res.status(401).json({ error: error | 'Unauthenticated request !' });
  }
};
