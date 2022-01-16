import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { handler } from '../../src/lambda-fns/update-user';
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
    UpdateItemCommand: jest.fn().mockImplementation(() => { return {}; }),
  };
});

describe('test update-user lambda', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test('test update-user lambda success', async() => {
    const user: User = {
      username: 'marciocadev',
      loginDate: '10/07/1973',
      name: 'Marcio',
      age: 48,
      lastname: 'Almeida',
      phone: '21-99999-9999',
      address: 'Rua que eu moro',
    };

    process.env.USER_TABLE_NAME = 'user-table';

    const result = await handler(user);
    expect(result).toMatchObject({});

    expect(UpdateItemCommand).toBeCalledTimes(1);
  });
});