export function getCreatedBy(user) {
    if (!user || !user.user_type) {
    throw new Error("Invalid user object");
  }
  if (user.user_type == 1) {
    return user.user_id;
  } else if (user.user_type == 2) {
    return user.user_id;
  } else if (
      user.user_type == 3 ||
      user.user_type == 4
    ) {
      return user.user_created_by;
    }
}