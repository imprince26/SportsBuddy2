import User from '../models/userModel.js';

export const addUserNotification = async (userOrId, notification) => {
  try {
    // Always fetch fresh user to avoid version conflicts
    // This prevents Mongoose optimistic locking errors when user doc was recently modified
    const userId = typeof userOrId === 'string' ? userOrId : userOrId._id;
    const user = await User.findById(userId);

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
