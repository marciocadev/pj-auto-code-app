import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { handler } from '../../src/lambda-fns/create-user';
import { User } from '../../src/lambda-fns/user/model';

jest.mock('@aws-sdk/client-dynamodb', () => {
  class MockDynamoDBClient {
    send() {
      return {
        Attributes: {},
      };
    }
  }
  return {
    DynamoDBClient: MockDynamoDBClient,
    PutItemCommand: jest.fn().mockImplementation(() => { return {}; }),
  };
});

describe('Create user', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test('Create User success', async() => {
    const event: User = {
      username: 'marciocadev',
      code: 1,
    };

    process.env.USER_TABLE_NAME = 'user-table';

    const result = await handler(event);
    expect(result).toMatchObject({});

    expect(PutItemCommand).toBeCalledTimes(1);
  });
});