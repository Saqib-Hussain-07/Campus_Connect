const validate = require('./validate');
const authValidators = require('./auth.validator');
const projectValidators = require('./project.validator');
const eventValidators = require('./event.validator');
const groupValidators = require('./group.validator');
const noticeValidators = require('./notice.validator');
const resourceValidators = require('./resource.validator');
const messageValidators = require('./message.validator');
const contactValidators = require('./contact.validator');

module.exports = {
  validate,
  ...authValidators,
  ...projectValidators,
  ...eventValidators,
  ...groupValidators,
  ...noticeValidators,
  ...resourceValidators,
  ...messageValidators,
  ...contactValidators
};
