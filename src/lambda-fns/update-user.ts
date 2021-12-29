import { UserClient } from '../lambda-fns/user/client';
import { User } from '../lambda-fns/user/model';

export const handler = async(event: { username: string; user: User}) => {
  const client = new UserClient();
  const result = await client.updateItem(event.username, event.user);
  return result.Attributes;
};