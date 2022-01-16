import { awscdk, FileBase, SourceCode } from 'projen';
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.3.0',
  defaultReleaseBranch: 'main',
  name: 'pj-auto-code-app',
  projenrcTs: true,

  authorName: 'Marcio Cruz de Almeida',
  authorEmail: 'marciocadev@gmail.com',
  repository: 'https://github.com/marciocadev/pj-auto-code-app',

  codeCov: true,
  gitpod: true,
  docgen: true,
  eslint: true,
  tsconfig: {
    compilerOptions: {
      lib: ['dom', 'es2019'],
    },
  },
  jestOptions: {
    coverageText: false,
  },
  // Major version number
  /*
    Everything before 1.0.0 is considered experimental and
    breaking changes are only minor version bumps. The moment
    ou feel comfortable you need to bump the version manually
    to 1.0.0 and then the well-known versioning kicks in where
    breaking changes bump the major version, features bump the
    minor and fixes bump the patch version.

    https://github.com/projen/projen/issues/982
    The commit contains the following structural elements, to
    communicate intent to the consumers of your library:
    1. fix: a commit of the type fix patches a bug in your
    codebase (this correlates with PATCH in semantic versioning).
    2. feat: a commit of the type feat introduces a new feature to
    the codebase (this correlates with MINOR in semantic versioning).
    3. BREAKING CHANGE: a commit that has the text BREAKING CHANGE:
    at the beginning of its optional body or footer section introduces
    a breaking API change (correlating with MAJOR in semantic versioning).
    A BREAKING CHANGE can be part of commits of any type.
    4. Others: commit types other than fix: and feat: are allowed, for
    example @commitlint/config-conventional (based on the Angular
    convention) recommends chore:, docs:, style:, refactor:, perf:,
    test:, and others.
  */
  majorVersion: 1,
  release: true,
});

function ts(path: string) : SourceCode {
  const src = new SourceCode(project, path);
  src.line(`// ${FileBase.PROJEN_MARKER}`);
  return src;
}

interface EntityType {
  key: string;
  type: string;
  partitionkey?: boolean;
  sortKey?: boolean;
  description?: string;
}

function createSchema(name: string, fields: EntityType[]) {
  const basename = name.toLowerCase();
  const model = ts(`src/lambda-fns/${basename}/model.ts`);
  model.open(`export interface ${name}Key {`);
  for (const field of fields) {
    if (field.partitionkey) {
      model.line('/**');
      model.line(`* **_${field.key}_** field is the **partition key**`);
      model.line('*');
      model.line('* @attribute');
      model.line('*/');
      model.line(`readonly ${field.key}: ${field.type}; // partition key`);
    } else if (field.sortKey) {
      model.line('/**');
      model.line(`* **_${field.key}_** field is the **sort key**`);
      model.line('*');
      model.line('* @attribute');
      model.line('*/');
      model.line(`readonly ${field.key}: ${field.type}; // sort key`);
    }
  }
  model.close('}');
  model.line('');
  model.open(`export interface ${name} extends ${name}Key {`);
  for (const field of fields) {
    if (!field.partitionkey && !field.sortKey) {
      model.line('/**');
      model.line('*');
      model.line('* @attribute');
      model.line('*/');
      model.line(`readonly ${field.key}?: ${field.type};`);
    }
  };
  model.close('}');
  model.line('');
}

function createTableConstruct(name: string, fields: EntityType[]) {
  const basename = name.toLowerCase();
  const env = `${name.toUpperCase()}_TABLE_NAME`;

  const table = ts(`src/constructs/${basename}-table.ts`);
  table.line('import { RemovalPolicy } from \'aws-cdk-lib\';');
  table.line('import { Table, AttributeType } from \'aws-cdk-lib/aws-dynamodb\';');
  table.line('import { Function } from \'aws-cdk-lib/aws-lambda\';');
  table.line('import { Construct } from \'constructs\';');
  table.line('');
  table.open('export enum GrantType {');
  table.line('Read = 1,');
  table.line('Write = 2,');
  table.line('ReadWrite = 3,');
  table.close('}');
  table.line('');
  table.line('/**');
  table.line(`* A Cloudformation \'AWS::DynamoDB::Table\' for **${name}** data`);
  table.line('*');
  table.line('* @cloudformationResource AWS::DynamoDB::Table');
  table.line('*/');
  table.open(`export class ${name}Table extends Table {`);
  table.line('/**');
  table.line(`* Create a new ${name}Table`);
  table.line('*');
  table.line('* @param scope - scope in which this resource is defined');
  table.line('* @param id    - scoped id of the resource');
  table.line('*/');
  table.open('constructor(scope: Construct, id: string) {');
  table.open('super(scope, id, {');
  for (const field of fields) {
    if (field.partitionkey) {
      table.open('partitionKey: {');
      table.line(`name: '${field.key}',`);
      if (field.type === 'number') {
        table.line('type: AttributeType.NUMBER,');
      } else if (field.type === 'string') {
        table.line('type: AttributeType.STRING,');
      } else if (field.type === 'binary') {
        table.line('type: AttributeType.BINARY,');
      }
      table.close('},');
    }
    if (field.sortKey) {
      table.open('sortKey: {');
      table.line(`name: '${field.key}',`);
      if (field.type === 'number') {
        table.line('type: AttributeType.NUMBER,');
      } else if (field.type === 'string') {
        table.line('type: AttributeType.STRING,');
      } else if (field.type === 'binary') {
        table.line('type: AttributeType.BINARY,');
      }
      table.close('},');
    }
  }

  table.line('removalPolicy: RemovalPolicy.DESTROY,');
  table.close('});');
  table.close('}');
  table.line('');
  table.line('/**');
  table.line('* Binding a table grant type to a handler');
  table.line('*');
  table.line('* @stability stable');
  table.line('* @param handler');
  table.line('* @param grantType');
  table.line('*/');
  table.open('public bind(handler: Function, grantType: GrantType) {');
  table.line(`handler.addEnvironment('${env}', this.tableName);`);
  table.open('if (grantType === GrantType.Write) {');
  table.line('this.grantWriteData(handler);');
  table.close('}');
  table.open('if (grantType === GrantType.Read) {');
  table.line('this.grantReadData(handler);');
  table.close('}');
  table.open('if (grantType === GrantType.ReadWrite) {');
  table.line('this.grantReadWriteData(handler);');
  table.close('}');
  table.close('}');
  table.close('}');
}

function createClient(name: string, fields: EntityType[]) {
  const basename = name.toLowerCase();
  const env = `${name.toUpperCase()}_TABLE_NAME`;
  const client = ts(`src/lambda-fns/${basename}/client.ts`);

  // imports dependencies and iniciate the class
  client.open('import {');
  client.line('DynamoDBClient,');
  client.line('PutItemCommand, PutItemCommandInput,');
  client.line('UpdateItemCommand, UpdateItemCommandInput,');
  client.line('GetItemCommand, GetItemCommandInput,');
  // client.line('BatchGetItemCommand, BatchGetItemCommandInput,');
  client.line('DeleteItemCommand, DeleteItemCommandInput,');
  client.close('} from \'@aws-sdk/client-dynamodb\';');
  client.line('import { marshall } from \'@aws-sdk/util-dynamodb\';');
  client.line(`import { ${name}, ${name}Key } from \'./model\';`);
  client.line('');
  client.open(`export class ${name}Client {`);
  client.line('readonly client = new DynamoDBClient({ region: process.env.AWS_REGION });');
  client.line('');
  // // create batch get item function
  // client.open(`public async batchGetItem(keys: ${name}Key[]) {`);
  // client.open('const input: BatchGetItemCommandInput = {');
  // client.open('RequestItems: {');
  // client.close('},');
  // client.close('};');
  // client.close('}');
  // client.line('');
  // create get item function
  client.open(`public async getItem(key: ${name}Key) {`);
  client.open('const input: GetItemCommandInput = {');
  client.line(`TableName: process.env.${env},`);
  client.line('Key: marshall(key),');
  client.close('};');
  client.line('return this.client.send(new GetItemCommand(input));');
  client.close('}');
  client.line('');
  // create delete item function
  client.open(`public async deleteItem(key: ${name}Key) {`);
  client.open('const input: DeleteItemCommandInput = {');
  client.line(`TableName: process.env.${env},`);
  client.line('Key: marshall(key),');
  client.close('};');
  client.line('return this.client.send(new DeleteItemCommand(input));');
  client.close('}');
  client.line('');
  // create put item function
  client.open(`public async putItem(item: ${name}) {`);
  client.open('const input: PutItemCommandInput = {');
  client.line(`TableName: process.env.${env},`);
  client.line('Item: marshall(item),');
  client.close('};');
  client.line('return this.client.send(new PutItemCommand(input));');
  client.close('}');
  client.line('');
  // create update item function
  client.open(`public async updateItem(item: ${name}) {`);
  client.line('let expAttrVal: { [key: string]: any } = {};');
  client.line('let upExp = \'set \';');
  client.line('let expAttrNames: { [key: string]: string } = {};');
  for (const field of fields) {
    if (!field.partitionkey && !field.sortKey) {
      client.open(`if (item.${field.key} !== null && item.${field.key} !== undefined) {`);
      client.line(`expAttrVal[\':${field.key}\'] = item.${field.key};`);
      client.line(`upExp = upExp + \'#${field.key} = :${field.key}\,';`);
      client.line(`expAttrNames[\'#${field.key}\'] = \'${field.key}\';`);
      client.close('}');
    }
  }
  client.line('upExp = upExp.slice(0, -1);');
  client.line('let keyObj: { [key: string]: any } = {};');
  for (const field of fields) {
    if (field.partitionkey) {
      client.line(`keyObj.${field.key} = item.${field.key};`);
    }
    if (field.sortKey) {
      client.line(`keyObj.${field.key} = item.${field.key};`);
    }
  }
  client.open('const input: UpdateItemCommandInput = {');
  client.line(`TableName: process.env.${env},`);
  client.line('Key: marshall(keyObj),');
  client.line('ExpressionAttributeValues: marshall(expAttrVal),');
  client.line('UpdateExpression: upExp,');
  client.line('ExpressionAttributeNames: expAttrNames,');
  client.close('};');
  client.line('return this.client.send(new UpdateItemCommand(input));');
  client.close('}');
  // end class
  client.close('}');
  client.line('');
}

function entity(name: string, fields: EntityType[]) {
  // Create Schema
  createSchema(name, fields);
  // Create Table Construct
  createTableConstruct(name, fields);
  // Create client
  createClient(name, fields);
}

entity('User', [
  { key: 'username', type: 'string', partitionkey: true },
  { key: 'loginDate', type: 'string', sortKey: true },
  { key: 'name', type: 'string' },
  { key: 'age', type: 'number' },
  { key: 'lastname', type: 'string' },
  { key: 'phone', type: 'string' },
  { key: 'address', type: 'string' },
]);

// entity('Company', { key: 'code', type: 'string' }, {
//   fields: [
//     { key: 'name', type: 'string' },
//     { key: 'age', type: 'number' },
//     { key: 'marketcap', type: 'number' },
//     { key: 'phone', type: 'string' },
//     { key: 'address', type: 'string' },
//   ],
// });

project.addDeps('@aws-sdk/client-dynamodb');
project.addDeps('@aws-sdk/util-dynamodb');

project.addDeps('cdk-nag@^2.0.0');

project.synth();