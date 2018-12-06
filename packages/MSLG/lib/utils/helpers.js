/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const TOKENS = require('../enums/parserConsts').TOKENIZER.OPERATORS;
const helpers = {
    parseEntity : function(item) {
        /*
         * interesting content can be
         * VALID: {entityName}, {callBackFunctionName()}
         * INVALID: {callBackFunctionName}, callBackFunctionName(), {entityName()}
        */
        const parsedEntities = {
            'entities': [],
            'callBacks': []
        };
        const entitiesRegExp = new RegExp(/(\{)(.*?)(\})/g);
        const callBackFunctionRegExp = new RegExp(/.*\((.*?)\)/g);
        const entitiesInItem = item.match(entitiesRegExp);
        if(!entitiesInItem || entitiesInItem.length === 0) return parsedEntities;
        entitiesInItem.forEach(entity => { 
            entity = entity.replace('{','').replace('}','');
            const callBackFunctions = entity.match(callBackFunctionRegExp);
            if(!callBackFunctions || callBackFunctions.length === 0) {
                parsedEntities.entities.push(entity);
            } else {
                let cbF = callBackFunctions[0].trim().replace('{', '');
                let functionName = cbF.substring(0, cbF.indexOf('('));
                let args = cbF.substring(cbF.indexOf('(') + 1, cbF.indexOf(')')).split(',');
                parsedEntities.callBacks.push({'functionName': functionName, 'args': args.map(item => item.trim())});
            }
        });
        return parsedEntities;
    },
    parseCondition : function(item) {
        const callBackFunctionRegExp = new RegExp(/.*\((.*?)\)/g);
        let callBackFunctions = entity.match(callBackFunctionRegExp);
    },
    getTemplatesInVariation: function(item) {
        return item.match(new RegExp(/\[(.*?)\]/g));
    }, 
    tokenizeCondition: function(item) {
        class Token {
            constructor(char, type) {
                this.content = char;
                this.type = type;
            }
        };
        let tokensInItem = [];
        let charbuffer = '';
        let priorToken = '';
        // spaces do not matter
        item = item.replace(/\s+/g, "");
        // breakdown to individual characters
        item = item.split("");
        
        item.forEach(function(char, idx) {
            // see if this char is a token
            let matchingToken = TOKENS[char];
            if(matchingToken !== undefined && matchingToken.name) {
                // push anything we might have in the char buffer
                if(charbuffer !== '') {
                    tokensInItem.push(new Token(charbuffer, 'string'));
                    charbuffer = '';
                }
                // see if this is a composite
                if(priorToken != '') {
                    if(priorToken.composites[0][char] !== undefined) {
                        // see if this is a composite token
                        tokensInItem[tokensInItem.length - 1] = new Token(priorToken.value + char, priorToken.composites[0][char]);
                    }
                    tokensInItem.push(new Token(char, matchingToken));
                    priorToken = '';
                    if(matchingToken.composites.length !== 0) priorToken = matchingToken;
                    return;
                } else if(tokensInItem.length !== 0 &&
                          tokensInItem[tokensInItem.length - 1].type !== 'string' &&
                          tokensInItem[tokensInItem.length - 1].type.completionToken.length !== 0 &&
                          tokensInItem[tokensInItem.length - 1].type.completionToken.includes(char)) {
                    // nothing to do here. 
                    return;
                }
                tokensInItem.push(new Token(char, matchingToken));
                priorToken = '';
                if(matchingToken.composites.length !== 0) priorToken = matchingToken;
            } else {
                // treat this as a character
                charbuffer += char;
            }
        });
        if(priorToken !== '' && tokensInItem[tokensInItem.length - 1].content !== priorToken.value) {
            // push the token
            tokensInItem.push(new Token(priorToken.value, TOKENS[priorToken]));
            priorToken = '';
        } 
        if(charbuffer !== '') {
            tokensInItem.push(new Token(charbuffer, 'string'));
        }
        
        // do post processing
        // strings need to be either enclosed in {} as an entity or be a call back function with a preceding ()
        // strings enclosed in {} is an entity
        // strings with preceeding () are funcition names
        // stings enclosed in () are parameters to call back functions 

        tokensInItem.forEach(function(tkn,idx) {
            if(tkn.type === 'string') {
                if(tokensInItem[idx - 1] !== undefined) {
                    if(tokensInItem[idx - 1].type.name === 'OPENPARAN') {
                        tkn.type = 'entity';
                        return;
                    }
                } 
                if (tokensInItem[idx + 1] !== undefined) {
                    if(tokensInItem[idx + 1].type.name === 'OPENPARAN') {
                        tkn.type = 'callBackFunction';
                        return;
                    }
                    if(tokensInItem[idx + 1].type.name === 'CLOSEPARAN') {
                        tkn.type = 'entity';
                        return;
                    }
                }
                if(tokensInItem[idx + 1] !== undefined && tokensInItem[idx - 1] !== undefined) {
                    if((tokensInItem[idx - 1].type.name === 'OPENPARANCURLEY') && (tokensInItem[idx + 1].type.name === 'CLOSEPARANCURLEY')) {
                        tkn.type = 'entity';
                        return;
                    } 
                    if ((tokensInItem[idx + 1].type.name === 'COMMA') && (tokensInItem[idx - 1].type.name === 'COMMA')) {
                        tkn.type = 'entity';
                        return;
                    }
                }
                tkn.type = 'value';
            }
        });
        return tokensInItem;
    },
    extractRegion(url) {
        const regex = /https?:\/\/(?:www\.)?([-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b)*(\/[\/\d\w\.-]*)*(?:[\?])*(.+)*/gi;
        const urlMatch = regex.exec(url)[1];
        const matchesArr = urlMatch.split('.');
        return matchesArr[0];
    }
};

module.exports = helpers;
