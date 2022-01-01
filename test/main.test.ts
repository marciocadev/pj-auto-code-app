import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { PjAutoCodeAppStack } from '../src/main';

test('Snapshot', () => {
  const app = new App();
  const stack = new PjAutoCodeAppStack(app, 'test');

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});

describe(('Validate my stack'), () => {
  let app: App;
  let stack: PjAutoCodeAppStack;
  let template: Template;

  beforeAll(() => {
    // GIVEN
    app = new App();
    // WHEN
    stack = new PjAutoCodeAppStack(app, 'test');
    // THEN
    template = Template.fromStack(stack);
  });

  test(('Count tables'), () => {
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
  });

  test(('Check keys'), () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      KeySchema: [
        Match.objectLike({
          AttributeName: 'username',
          KeyType: 'HASH',
        }),
        Match.objectLike({
          AttributeName: 'code',
          KeyType: 'RANGE',
        }),
      ],
    });
  });

  test(('Check attributes'), () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      AttributeDefinitions: [
        Match.objectLike({
          AttributeName: 'username',
          AttributeType: 'S',
        }),
        Match.objectLike({
          AttributeName: 'code',
          AttributeType: 'N',
        }),
      ],
    });
  });

  test(('Check removal policy'), () => {
    template.hasResource('AWS::DynamoDB::Table', {
      UpdateReplacePolicy: Match.exact('Delete'),
    });
  });

  test('Count Lambdas', () => {
    template.resourceCountIs('AWS::Lambda::Function', 3);
  });

});