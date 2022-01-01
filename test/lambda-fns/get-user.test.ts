import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { handler } from '../../src/lambda-fns/get-user';
import { User } from '../../src/lambda-fns/user/model';

jest.mock('@aws-sdk/client-dynamodb', () => {
  class MockDynamoDBClient {
    send() {
      return {
        Item: {
          username: 'marciocadev',
          code: 1,
          name: 'Marcio',
        },
      };
    }
  }
  return {
    DynamoDBClient: MockDynamoDBClient,
    GetItemCommand: jest.fn().mockImplementation(() => { return {}; }),
  };
});

describe('test get-user lambda', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test('test get-user lambda success', async() => {
    const event: User = {
      username: 'marciocadev',
      code: 1,
    };

    process.env.USER_TABLE_NAME = 'user-table';

    const result = await handler(event);
    expect(result).toMatchObject({
      username: 'marciocadev',
      code: 1,
      name: 'Marcio',
    });

    expect(GetItemCommand).toBeCalledTimes(1);
  });
});