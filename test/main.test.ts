import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
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
});