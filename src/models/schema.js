const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullname: { type: String, required: true },
  imgUrl: { type: String },
  phonenumber: { type: String },
  country: { type: String},
  notifications: [
    {
      message: { type: String, required: true },
      status: { type: String, enum: ['Read', 'Unread'], default: 'Unread' },
    },
  ],
  createdAt: { type: Date, default: Date.now }
});

const moduleSchema = new Schema({
  moduleName: {
    type: String,
    enum: ['Workmanagement', 'CRM', 'Dev', 'Service'],
    required: true,
  },
  description: { type: String, default: '' },
  workspaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const favouritesSchema = new Schema({
  favouriteName: {
    type: String,
    enum: ['Workmanagement', 'CRM', 'Dev', 'Service'],
    required: true,
  },
  description: { type: String, default: '' },
  workspaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' }],
  boards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Board' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


const workspaceSchema = new Schema({
  workspaceName: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['admin', 'member'], default: 'member' },
    },
  ],
  boards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Board' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const boardSchema = new Schema({
  boardName: { type: String, required: true },
  workspaceName: { type: String }, 
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  type: { type: String, default: 'Item'},
  description: { type: String },
  createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const groupSchema = new Schema({
  groupName: { type: String, required: true },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],
  leads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lead' }],
  sprints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' }],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  bugs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bug' }],
  tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
  incidents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Incident' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


const itemSchema = new Schema({
  itemName: { type: String, required: true },
  description: { type: String },
  status: { type: String },
  priority: { type: String },
  dueDate: { type: Date },
  assignedToId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const leadSchema = new Schema({
  leadName: { type: String, required: true },
  status: { type: String },
  company: { type: String },
  title: { type: String},
  email: { type: String },
  lastInteraction: {type: Date},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const taskSchema = new Schema({
  taskName: { type: String, required: true },
  person:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}], 
  status: { type: String },
  priority: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const sprintSchema = new Schema({
  sprintName: { type: String, required: true },
  sprintGoals: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  connectedGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const bugSchema = new Schema({
  bugName: { type: String, required: true },
  reporter: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  developer: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  priority: { type: String },
  status: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ticketSchema = new Schema({
  ticketName: { type: String, required: true },
  description: { type: String },
  employee: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  agent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  requestType: { type: String },
  priority: { type: String },
  status: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}); 

module.exports = {
  User : mongoose.model('User', userSchema),
  Module : mongoose.model('Module', moduleSchema),
  Favourite : mongoose.model('Favourite', favouritesSchema),
  Workspace : mongoose.model('Workspace', workspaceSchema),
  Board : mongoose.model('Board', boardSchema),
  Group : mongoose.model('Group', groupSchema),
  Item : mongoose.model('Item', itemSchema),
  Lead: mongoose.model('Lead', leadSchema),
  Sprint: mongoose.model('Sprint', sprintSchema),
  Bug: mongoose.model('Bug', bugSchema),
  Ticket: mongoose.model('Ticket', ticketSchema),
  Task: mongoose.model('Task', taskSchema),
};

