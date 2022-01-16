import { UserClient } from '../lambda-fns/user/client';
import { UserKey } from './user/model';

export const handler = async(event: UserKey) => {
  const client = new UserClient();
  await client.deleteItem(event);
};