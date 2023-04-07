export const isUserAnAdmin = (userId: string) => {
  return (userId && userId === process.env.ADMIN_ID);
}
