const express = require('express');
const router = express.Router();
const { saveInvite, getInvite, deleteInvite } = require('../../models/Invite');
const requireJwtAuth = require('../../middleware/requireJwtAuth');
const sendEmail = require('../../utils/sendEmail');

const isProduction = process.env.NODE_ENV === 'production';
const clientUrl = isProduction ? process.env.CLIENT_URL_PROD : process.env.CLIENT_URL_DEV;

router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    const invite = await getInvite(email);
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }
    res.status(200).json(invite);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error getting invite' });
  }
});
router.post('/', requireJwtAuth, async (req, res) => {
  try {
    const user = req.user;
    const { emails, role } = req.body;
    const invites = await Promise.all(
      emails.map(async (email) => {
        const invite = await saveInvite(email, user._id, role);
        if (invite.message) {
          return res.status(500).json(invite);
        }
        const subject = `${user?.name} has invited you to join ChatGPT`;
        const link = `${clientUrl}/register?invite_code=${invite._id}`;
        await sendEmail(
          email,
          subject,
          { name: user?.name, link },
          './emails/emailInvite.handlebars'
        );
        return invite;
      })
    );
    res.status(200).json(invites);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error saving invite' });
  }
});
router.delete('/:id', requireJwtAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await deleteInvite(id);
    res.status(200).json({ message: 'Invite removed' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error deleting invite' });
  }
});

module.exports = router;
