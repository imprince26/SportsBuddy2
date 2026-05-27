import User from '../models/userModel.js';

export const addUserNotification = async (userOrId, notification) => {
  try {
    const user = typeof userOrId === 'object' && userOrId?.addNotification
      ? userOrId
      : await User.findById(userOrId);

    if (!user) {
      return false;
    }

    await user.addNotification({
      ...notification,
      timestamp: notification.timestamp || new Date(),
    });

    return true;
  } catch (error) {
    console.error('Error adding user notification:', error);
    return false;
  }
};
