const { User, Workspace } = require('../models/schema'); 
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { JWT_SECRET, SALT_ROUNDS } = process.env;
exports.findUserByEmail = async (email) => {
  try {
    return await User.findOne({ email });
  } catch (error) {
    console.log('Error finding user');
  }  
};

exports.findUserByUserName = async (username) => {
  try {
    return await User.findOne({ username });
  } catch (error) {
    console.log('Error finding user');
  }  
};

exports.createUser = async (userData) => {
  try {
    const newUser = new User(userData);
    await newUser.save();
    return newUser;
  } catch (error) {
    console.log('Error creating user');
  }
};

exports.sendPasswordResetEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
  }

  const resetToken = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
  
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9;">
        <h2>Password Reset</h2>
        <p>Click <a href="${resetLink}" style="color: #007bff;">here</a> to reset your password. This link will expire in 1 hour.</p>
        <small>If you did not request this email, you can safely ignore it.</small>
      </div>
    `,
  });
};

exports.sendInviteMemberRequestEmail = async (email, role, workspaceId, adminId) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
  }
  const workspace = Workspace.findById(workspaceId);
  const adminUser = User.findById(adminId);
  const resetToken = jwt.sign({ userId: user._id, email: user.email, role,adminId, workspaceId }, JWT_SECRET, { expiresIn: '1h' });
  const resetLink = `http://localhost:3000/invite-user?token=${resetToken}&name=${adminUser.fullname}&workspaceName=${workspace.workspaceName}`;
  
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Workspace Member Adding Request',
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9;">
        <h2>User Invite</h2>
        <p>Click <a href="${resetLink}" style="color: #007bff;">here</a> to add as a memeber to workspace in Work Flow. This link will expire in 1 hour.</p>
        <small>If you are not willing to add as a member, you can safely ignore it.</small>
      </div>
    `,
  });
};

exports.addMemberToWorkspace = async (workspaceId, userId, adminId, role) => {
  try {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
        console.log('Workspace not found');
    }
    if (workspace.createdBy.toString() !== adminId) {
        return 'You do not have permission to add a user to this workspace';
    }
    const isAlreadyMember = workspace.members.some(
        member => member.userId.toString() === userId
    );
    if (isAlreadyMember) {
        return 'User is already a member of this workspace';
    }
    workspace.members.push({ userId, role });
    const updatedWorkspace = await workspace.save();
    return 'User added to Workspace successfully';
  } catch (error) {
    console.error('Error adding member to workspace:', err);
  }  
};

exports.isUserWithEmailExists = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
  }
};

exports.resetPassword = async (token, newPassword) => {
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    error.status = 401;
    console.log('Invalid or expired token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, Number(SALT_ROUNDS));
  await User.findByIdAndUpdate(
    decoded.id, 
    { password: hashedPassword }, 
    { new: true }
  );
};

exports.getAllUsers = async () => {
  try {
    return await User.find(); 
  } catch (error) {
    console.log('Error fetching users');
  }
};

exports.getUserDetails = async (userId) => {
  try {
    const user = await User.findById(userId); 
    return {fullname: user.fullname, email: user.email, picture: user.imgUrl};
  } catch (error) {
    console.log('Error fetching users');
  }
};

exports.checkRole = async (workspaceId, userId) => {
  try {
      const workspace = await Workspace.findById(workspaceId).populate({
          path: 'members.userId',
          select: 'email fullname',
      });
      if (!workspace) {
          console.log('Workspace not found');
      }
      const member = workspace.members.find(
          (member) => member.userId && member.userId._id.toString() === userId
      );
      if (!member) {
          console.log('User not found in this workspace');
      }
      return { role: member.role };
  } catch (error) {
      console.error('Error checking role:', error);
  }
};
