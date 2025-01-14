const userService = require('../services/userservice');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.signup = async (req, res) => {
  try {
    const { email, password, fullname} = req.body;
    const user = await userService.findUserByEmail(email);
    if (user) {
      return res.status(400).json({ message: 'User already found!' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userService.createUser({
      email,
      password: hashedPassword,
      fullname
    });
    
    res.status(201).json({ message: 'User created successfully', user: newUser });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

exports.email = async (req, res) => {
  try {
    const { email} = req.body;
    const user = await userService.findUserByEmail(email);
    if (user) {
      return res.status(409).json({ message: 'User already found!' });
    }
    res.status(200).json({ message: 'User can be created successfully' });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // console.log(token);
    res.status(200).json({ message: 'Login successful', token,userName:user.fullname ,userId:user._id});
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong!' });
  }
};
exports.logout = (req, res) => {
  try {
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

exports.OAuth = async (req, res) => {
  try {
    const { email,name} = req.body;
    const password = name;
    // console.log(email,name,password);
    let user = await userService.findUserByEmail(email);
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await userService.createUser({
        email,
        password: hashedPassword,
        fullname:name,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // console.log(token);
    res.status(200).json({ message: 'Login successful', token,userName:user.fullname,userId:user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

exports.verifyToken = (req, res, next) => {
  const {token} = req.body;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    res.status(200).json({message:'Valid Token'});
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

exports.sendPasswordResetEmail = async (req, res) => {
  try {
    const { email } = req.body;
    await userService.sendPasswordResetEmail(email);
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || 'Something went wrong' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await userService.resetPassword(token, newPassword);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || 'Invalid or expired token' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers(); 
    res.status(200).json(users); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

exports.checkRole = async (req, res) => {
  try {
    const { workspaceId, userId } = req.body;
    const role = await userService.checkRole(workspaceId, userId);
    res.status(200).json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error occured!' });
  }
}