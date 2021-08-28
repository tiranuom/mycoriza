import {OperationOb} from "./types";
import camelcase from "camelcase";
import Handlebars from 'handlebars'
import fs from "fs";
import {OpenAPIV3} from "openapi-types";
import {extractReturnType} from "./util";
import OperationObject = OpenAPIV3.OperationObject;

const template = `
import {NetworkStateFamily} from "mycoriza-runtime";
import {combineReducers} from "redux";
{{#each imports}}
import { {{this}} } from '../../models/{{this}}';
{{/each}}
{{#each ops}}
import { {{simpleName}}Reducer } from './{{simpleName}}';
{{/each}}

export interface {{typeName}}State {
    {{#each ops}}
    {{simpleName}}: NetworkStateFamily<{{typeName}}>
    {{/each}}
}

/**
 * Combined reducer for the {{typeName}} scope
 *
 * Following scopes are available. Related hooks are available alongside the reducers.
 * 
{{#each ops}}
 * {@link {{simpleName}}Reducer}
{{/each}}
 */
export const {{directory}}Reducers = combineReducers<{{typeName}}State>({
{{#each ops}}
    {{simpleName}}: {{simpleName}}Reducer,
{{/each}}
})
`

export function renderScopedReducer(operations: OperationOb[], outputDir: string, key: string) {

    let directory = camelcase(key);

    let ops = operations.map(op => {
        let operation: OperationObject<any> = op.operation
        let {shouldImport, typeName} = extractReturnType(operation) ?? {shouldImport: false, typeName: "unknown"}

        return ({
            typeName,
            simpleName: camelcase(operation.operationId),
            shouldImport
        });
    }).filter(a => !!a);


    let content = Handlebars.compile(template)({
        typeName: camelcase(key, {pascalCase: true}),
        directory: directory,
        ops: ops,
        imports: new Set(ops.filter(a => a.shouldImport).map(a => a.typeName).map(a => a.replace('[]', '')))
    });

    if (fs.existsSync(`${outputDir}/reducers/${directory}/index.ts`)) {
        fs.unlinkSync(`${outputDir}/reducers/${directory}/index.ts`)
    }
    if (!fs.existsSync(`${outputDir}/reducers/${directory}`)) {
        fs.mkdirSync(`${outputDir}/reducers/${directory}`)
    }
    fs.writeFileSync(`${outputDir}/reducers/${directory}/index.ts`, content)
}
