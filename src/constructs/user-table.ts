// ~~ Generated by projen. To modify, edit .projenrc.js and run "npx projen".
import { RemovalPolicy } from 'aws-cdk-lib';
import { Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export enum GrantType {
  Read = 1,
  Write = 2,
  ReadWrite = 3,
}

/**
* A Cloudformation 'AWS::DynamoDB::Table' for **User** data
*
* @cloudformationResource AWS::DynamoDB::Table
*/
export class UserTable extends Table {
  /**
  * Create a new UserTable
  *
  * @param scope - scope in which this resource is defined
  * @param id    - scoped id of the resource
  */
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      partitionKey: {
        name: 'username',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'code',
        type: AttributeType.NUMBER,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }

  /**
  * Binding a table grant type to a handler
  *
  * @stability stable
  * @param handler
  * @param grantType
  */
  public bind(handler: Function, grantType: GrantType) {
    handler.addEnvironment('USER_TABLE_NAME', this.tableName);
    if (grantType === GrantType.Write) {
      this.grantWriteData(handler);
    }
    if (grantType === GrantType.Read) {
      this.grantReadData(handler);
    }
    if (grantType === GrantType.ReadWrite) {
      this.grantReadWriteData(handler);
    }
  }
};