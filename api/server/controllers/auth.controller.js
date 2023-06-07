const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const {
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPassword
} = require('../services/auth.service');

const isProduction = process.env.NODE_ENV === 'production';
const refreshSecret = isProduction
  ? process.env.REFRESH_TOKEN_SECRET_PROD
  : process.env.REFRESH_TOKEN_SECRET_DEV;

const loginController = async (req, res) => {
  try {
    const token = req.user.generateToken();
    const user = await loginUser(req.user);
    if (user) {
      res.cookie('token', token, {
        expires: new Date(Date.now() + eval(process.env.SESSION_EXPIRY)),
        httpOnly: false,
        secure: isProduction
      });
      // set signed cookie for refresh token
      res.cookie('refreshToken', user.refreshToken[user.refreshToken.length - 1].refreshToken, {
        expires: new Date(Date.now() + eval(process.env.REFRESH_TOKEN_EXPIRY)),
        httpOnly: true,
        secure: isProduction,
        signed: true
      });
      res.status(200).send({ token, user });
    } else {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

const logoutController = async (req, res) => {
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;
  try {
    const logout = await logoutUser(req.user, refreshToken);
    console.log(logout);
    const { status, message } = logout;
    if (status === 200) {
      res.clearCookie('token');
      res.clearCookie('refreshToken', { signed: true });
      res.status(status).send({ message });
    } else {
      res.status(status).send({ message });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

const registrationController = async (req, res) => {
  try {
    const response = await registerUser(req.body);
    if (response.status === 200) {
      const { status, user } = response;
      const token = user.generateToken();
      //send token for automatic login
      res.cookie('token', token, {
        expires: new Date(Date.now() + eval(process.env.SESSION_EXPIRY)),
        httpOnly: false,
        secure: isProduction
      });
      // set signed cookie for refresh token
      res.cookie('refreshToken', user.refreshToken[user.refreshToken.length - 1].refreshToken, {
        expires: new Date(Date.now() + eval(process.env.REFRESH_TOKEN_EXPIRY)),
        httpOnly: true,
        secure: isProduction,
        signed: true
      });
      res.status(status).send({ user });
    } else {
      const { status, message } = response;
      res.status(status).send({ message });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

const getUserController = async (req, res) => {
  return res.status(200).send(req.user);
};

const resetPasswordRequestController = async (req, res) => {
  try {
    const resetService = await requestPasswordReset(req.body.email);
    if (resetService) {
      return res.status(200).end();
    } else {
      return res.status(400).json(resetService);
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: e.message });
  }
};

const resetPasswordController = async (req, res) => {
  try {
    const resetPasswordService = await resetPassword(
      req.body.userId,
      req.body.token,
      req.body.password
    );
    if (resetPasswordService instanceof Error) {
      return res.status(400).json(resetPasswordService);
    } else {
      return res.status(200).json(resetPasswordService);
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: e.message });
  }
};

const refreshController = async (req, res) => {
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;

  if (refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, refreshSecret);
      const userId = payload.id;
      const user = await User.findById(userId);
      if (user) {
        const tokenIndex = user.refreshToken.findIndex(
          (item) => item.refreshToken === refreshToken
        );

        if (tokenIndex === -1) {
          console.log('token not found');
          res.statusCode = 401;
          res.send('Unauthorized');
        } else {
          const token = req.user.generateToken();
          const newRefreshToken = req.user.generateRefreshToken();
          user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken };
          await user.save();
          res.cookie('token', token, {
            expires: new Date(Date.now() + eval(process.env.SESSION_EXPIRY)),
            httpOnly: false,
            secure: isProduction
          });
          res.cookie('refreshToken', newRefreshToken, {
            expires: new Date(Date.now() + eval(process.env.REFRESH_TOKEN_EXPIRY)),
            httpOnly: true,
            secure: isProduction,
            signed: true
          });
          const userPayload = req.user.toJSON();
          delete userPayload.refreshToken;
          res.status(200).send({ token, user: userPayload });
        }
      } else {
        res.statusCode = 401;
        res.send('Unauthorized');
      }
    } catch (err) {
      res.statusCode = 401;
      res.send('Unauthorized');
    }
  } else {
    res.statusCode = 401;
    res.send('Unauthorized');
  }
};

module.exports = {
  getUserController,
  loginController,
  logoutController,
  refreshController,
  registrationController,
  resetPasswordRequestController,
  resetPasswordController
};
