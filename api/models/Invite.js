const Invite = require('./schema/inviteSchema');

module.exports = {
  Invite,
  saveInvite: async (email, invitedBy, role) => {
    try {
      return await Invite.findOneAndUpdate(
        { email },
        { email, invitedBy, role },
        { new: true, upsert: true }
      ).exec();
    } catch (error) {
      console.log(error);
      return { message: 'Error saving invite' };
    }
  },
  getInvite: async (invite_code) => {
    try {
      return await Invite.findById(invite_code).exec();
    } catch (error) {
      console.log(error);
      return { message: 'Error getting invites' };
    }
  },
  deleteInvite: async (invite_code) => {
    try {
      return await Invite.findByIdAndDelete(invite_code).exec();
    } catch(error) {
      console.log(error);
      return { message: 'Error deleting invite' };
    }
  }
};
