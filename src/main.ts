import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { UserTable } from './constructs/user-table';

export class PjAutoCodeAppStack extends Stack {
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

app.synth();