import { UserClient } from '../lambda-fns/user/client';
import { User } from '../lambda-fns/user/model';

export const handler = async(event: User) => {
  const client = new UserClient();
  const result = await client.putItem(event);
  return result.Attributes;
};