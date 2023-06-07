const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inviteSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  role: {
    type: String,
    enum: ['ADMIN', 'PARENT', 'CHILD'],
  },
  invitedAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('Invite', inviteSchema);
