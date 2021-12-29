import { UserClient } from '../lambda-fns/user/client';

export const handler = async(event: { username: string; code: number}) => {
  const client = new UserClient();
  const result = await client.getItem(event.username, event.code);
  return result.Item;
};