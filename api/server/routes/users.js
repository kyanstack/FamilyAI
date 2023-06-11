const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const requireJwtAuth = require('../../middleware/requireJwtAuth');
const Invite = require('../../models/schema/inviteSchema');

router.get('/', requireJwtAuth, async (req, res) => {
  try {
    const search = req.query.search;
    const user = req.user;
    if (user.role === 'CHILD') {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const query = {};

    if (search !== '') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (user.role === 'PARENT') {
      query.invitedBy = user.id;
    }

    const users = await User.find(query);
    const invites = await Invite.find(query);

    const data = [...users, ...invites.map((invite) => ({ ...invite._doc, isInvite: true }))];
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.patch('/:id', requireJwtAuth, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'ADMIN') {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { role } = req.body;
    // update role of user
    await User.updateOne({ _id: id }, { role });
    res.status(200).json({ message: 'User role updated' });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete('/:id', requireJwtAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!['ADMIN', 'PARENT'].includes(user.role)) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    await User.deleteOne({ _id: id });
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
