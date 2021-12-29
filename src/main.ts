import { App, Aspects, Stack, StackProps } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { Construct } from 'constructs';
import { UserTable } from './constructs/user-table';

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

    new UserTable(this, 'UserTable');
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new PjAutoCodeAppStack(app, 'my-stack-dev', { env: devEnv });
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

Aspects.of(app).add(new AwsSolutionsChecks());

app.synth();