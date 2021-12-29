import { awscdk, FileBase, SourceCode } from 'projen';
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.3.0',
  defaultReleaseBranch: 'main',
  name: 'pj-auto-code-app',
  projenrcTs: true,

  authorName: 'Marcio Cruz de Almeida',
  authorEmail: 'marciocadev@gmail.com',
  repository: 'https://github.com/marciocadev/pj-auto-code-app',
  // don't update snapshot when run jest
  antitamper: false,
  docgen: true,
  eslint: true,
  tsconfig: {
    compilerOptions: {
      lib: ['dom', 'es2019'],
    },
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
  // majorVersion: 1,
  release: true,
});

interface EntityType {
  key: string; type: string;
}

interface EntityProps {
  readonly sortKey?: EntityType;
  readonly fields?: Array<EntityType>;
}

function createSchema(name: string, partitionKey: EntityType, props: EntityProps) {
  const basename = name.toLowerCase();
  const model = ts(`src/${basename}/model.ts`);
  model.open(`export interface ${name} {`);
  model.line(`readonly ${partitionKey.key}: string; // key`);
  if (props.sortKey) {
    model.line(`readonly ${props.sortKey.key}: ${props.sortKey.type}; // sort key`);
  }
  if (props.fields) {
    for (const field of props.fields) {
      model.line(`readonly ${field.key}?: ${field.type};`);
    }
  };
  model.close('};');
}

function createTableConstruct(name: string, partitionKey: EntityType, props: EntityProps) {
  const basename = name.toLowerCase();
  const env = `${name.toUpperCase()}_TABLE_NAME`;

  const table = ts(`src/constructs/${basename}-table.ts`);
  table.line('import { RemovalPolicy } from \'aws-cdk-lib\';');
  table.line('import { Table, AttributeType } from \'aws-cdk-lib/aws-dynamodb\';');
  table.line('import { Function } from \'aws-cdk-lib/aws-lambda\';');
  table.line('import { Construct } from \'constructs\';');
  table.line('');
  table.open(`export class ${name}Table extends Table {`);
  table.open('constructor(scope: Construct, id: string) {');
  table.open('super(scope, id, {');
  table.open('partitionKey: {');
  table.line(`name: '${partitionKey.key}',`);
  if (partitionKey.type === 'number') {
    table.line('type: AttributeType.NUMBER,');
  } else if (partitionKey.type === 'string') {
    table.line('type: AttributeType.STRING,');
  } else if (partitionKey.type === 'binary') {
    table.line('type: AttributeType.BINARY,');
  }
  table.close('},');
  if (props.sortKey) {
    table.open('sortKey: {');
    table.line(`name: '${props.sortKey.key}',`);
    if (props.sortKey.type === 'number') {
      table.line('type: AttributeType.NUMBER,');
    } else if (props.sortKey.type === 'string') {
      table.line('type: AttributeType.STRING,');
    } else if (props.sortKey.type === 'binary') {
      table.line('type: AttributeType.BINARY,');
    }
    table.close('},');
  }
  table.line('removalPolicy: RemovalPolicy.DESTROY,');
  table.close('});');
  table.close('}');
  table.line('');
  table.open('public bind(handler: Function, grantType: string) {');
  table.line(`handler.addEnvironment('${env}', this.tableName);`);
  table.open('if (grantType.toLowerCase() === \'write\') {');
  table.line('this.grantWriteData(handler);');
  table.close('}');
  table.open('if (grantType.toLowerCase() === \'read\') {');
  table.line('this.grantReadData(handler);');
  table.close('}');
  table.open('if (grantType.toLowerCase() === \'readwrite\') {');
  table.line('this.grantReadWriteData(handler);');
  table.close('}');
  table.close('}');
  table.close('};');
}

function ts(path: string) : SourceCode {
  const src = new SourceCode(project, path);
  src.line(`// ${FileBase.PROJEN_MARKER}`);
  return src;
}

function entity(name: string, partitionKey: EntityType, props: EntityProps) {
  // Create Schema
  createSchema(name, partitionKey, props);
  // Create Table Construct
  createTableConstruct(name, partitionKey, props);
}

entity('User', { key: 'username', type: 'string' }, {
  sortKey: { key: 'code', type: 'number' },
  fields: [
    { key: 'name', type: 'string' },
    { key: 'age', type: 'number' },
    { key: 'lastname', type: 'string' },
    { key: 'phone', type: 'string' },
    { key: 'address', type: 'string' },
  ],
});

project.synth();