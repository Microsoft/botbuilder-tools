/**
 * @module botbuilder-lg-vscode
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TextDocument, Range, Position, workspace } from "vscode";
import { LGTemplate, TemplateEngine } from "botbuilder-lg";
import { DataStorage, TemplateEngineEntity } from "./dataStorage";
import * as vscode from 'vscode';
import { ReturnType } from "botframework-expressions";
import { buildInfunctionsMap, FunctionEntity } from './buildinFunctions';

export function isLgFile(fileName: string): boolean {
    if(fileName === undefined || !fileName.endsWith('.lg')) {
        return false;
    }
    return true;
}

export function isInFencedCodeBlock(doc: TextDocument, position: Position): boolean {
    let textBefore = doc.getText(new Range(new Position(0, 0), position));
    let matches = textBefore.match(/```[\w ]*$/gm);
    if (matches == null) {
        return false;
    } else {
        return matches.length % 2 != 0;
    }
}

export function getAllTemplatesFromCurrentLGFile(lgFileUri: vscode.Uri) :LGTemplate[] {
    let engineEntity: TemplateEngineEntity = DataStorage.templateEngineMap.get(lgFileUri.fsPath);
    if (engineEntity === undefined || engineEntity.templateEngine === undefined) {
        return [];
    }

    return engineEntity.templateEngine.templates;
}

export function getAllTemplateFromCurrentWorkspace() :LGTemplate[] {
    let templates: LGTemplate[] = [];

    DataStorage.templateEngineMap.forEach(u => templates = templates.concat(u.templateEngine.templates));

    templates = templates.filter((resource: LGTemplate, index: number, self: LGTemplate[]) =>
        index === self.findIndex((t: LGTemplate) => (
            t.name === resource.name && t.source === resource.source
        ))
    );

    return templates;
}

export function getreturnTypeStrFromReturnType(returnType: ReturnType): string {
    let result = '';
    switch(returnType) {
        case ReturnType.Boolean: result = "boolean";break;
        case ReturnType.Number: result = "number";break;
        case ReturnType.Object: result = "any";break;
        case ReturnType.String: result = "string";break;
    }

    return result;
}

export function getAllFunctions(lgFileUri: vscode.Uri): Map<string, FunctionEntity> {
    const functions: Map<string, FunctionEntity> = new Map<string, FunctionEntity>();

    for (const func of buildInfunctionsMap) {
        functions.set(func[0],func[1]);
    }

    const templates: LGTemplate[] = getAllTemplatesFromCurrentLGFile(lgFileUri);

    for (const template of templates) {
        var functionEntity = new FunctionEntity(template.parameters, ReturnType.Object, 'Template reference');
        functions.set(template.name, functionEntity);
    }

    return functions;
}