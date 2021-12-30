import { join } from 'path';
import { App, Aspects, Stack, StackProps } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { UserTable, GrantType } from './constructs/user-table';

/**
 * Basic stack
 */
export class PjAutoCodeAppStack extends Stack {
  /**
   * Create a new PjAutoCodeAppStack
   *
   * @param scope - scope in which this resource is defined
   * @param id    - scoped id of the resource
   * @param props - resource properties
   */
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const users = new UserTable(this, 'UserTable');

    const createHandler = new NodejsFunction(this, 'CreateUser', {
      entry: join(__dirname + '/lambda-fns/create-user.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_14_X,
      bundling: {
        minify: true,
      },
    });
    users.bind(createHandler, GrantType.Write);
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

const stack = new PjAutoCodeAppStack(app, 'my-stack-dev', { env: devEnv });
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

Aspects.of(app).add(new AwsSolutionsChecks());
NagSuppressions.addStackSuppressions(stack, [
  { id: 'AwsSolutions-IAM4', reason: 'handler receive the correct table grant to action' },
]);

app.synth();