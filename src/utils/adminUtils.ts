/**
 * Checks if a user has admin privileges
 * @param user The user object to check
 * @returns boolean indicating if the user is an admin
 */
export const isAdmin = (user: any): boolean => {
  if (!user) return false;
  return user.isAdmin === true;
};

/**
 * Checks if a user can modify an item (either they created it or they're an admin)
 * @param user The user object
 * @param createdBy The ID of the user who created the item
 * @returns boolean indicating if the user can modify the item
 */
export const canModifyItem = (user: any, createdBy: string | undefined): boolean => {
  if (!user || !createdBy) return false;
  return user.uid === createdBy || isAdmin(user);
}; 