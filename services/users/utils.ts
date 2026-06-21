// User related utility functions
export const formatUserName = (user: any) => {
  if (!user) return ''
  return `${user.firstName} ${user.lastName}`
}
