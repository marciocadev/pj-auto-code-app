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

describe('test delete-user lambda', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test('test delete-user lambda success', async() => {
    const event: User = {
      username: 'marciocadev',
      loginDate: '10/07/1973',
    };

    process.env.USER_TABLE_NAME = 'user-table';

    await handler(event);

    expect(DeleteItemCommand).toBeCalledTimes(1);
  });
});