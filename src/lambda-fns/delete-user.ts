import { UserClient } from '../lambda-fns/user/client';

export const handler = async(event: { username: string; code: number}) => {
  const client = new UserClient();
  await client.deleteItem(event);
};