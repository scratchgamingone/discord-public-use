// commands/admin/GuildMemberAdd.js
const { createPersonalSpace } = require('../../utils/personalSpace');

module.exports = {
  name: 'GuildMemberAdd',
  async execute(member) {
    if (!member.user.bot) {
      await createPersonalSpace(member);
    }
  },
};
