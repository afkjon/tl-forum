import { type User } from "@clerk/nextjs/dist/api"

export const filterUserforClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl
  }
}