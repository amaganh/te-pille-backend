import UserModel from '../models/User';

export async function checkUser(uuid: string) {
  const user = await UserModel.findById(uuid);
  if (!user) return false;

  return user;
}
