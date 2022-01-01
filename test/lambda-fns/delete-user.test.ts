import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { handler } from '../../src/lambda-fns/delete-user';
import { User } from '../../src/lambda-fns/user/model';

jest.mock('@aws-sdk/client-dynamodb', () => {
  class MockDynamoDBClient {
    send() {
      return null;
    }
  }
  return {
    DynamoDBClient: MockDynamoDBClient,
    DeleteItemCommand: jest.fn().mockImplementation(() => { return {}; }),
  };
});

describe('Delete user', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test('Delete User success', async() => {
    const event: User = {
      username: 'marciocadev',
      code: 1,
    };

    process.env.USER_TABLE_NAME = 'user-table';

    await handler(event);

    expect(DeleteItemCommand).toBeCalledTimes(1);
  });
});