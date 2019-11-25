# lg-language README

Language Generation vscode extension. 

Get more detail -> [Language Generation](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/language-generation)

# how to use for customer
- into LGvscodeExt folder
- To get access to the daily builds of this library, configure npm to use the MyGet feed before installing.
    - `npm config set registry https://botbuilder.myget.org/F/botbuilder-v4-js-daily/npm/`
- To reset the registry in order to get the latest published version, run:
    - `npm config set registry https://registry.npmjs.org/`
- `npm install` to install packagesnpm run compile
- `npm run build`
- `npm install -g vsce`, if `vsce` is not installed globally.
- use `vsce package` to export vsix file
- open vscode, and extension tab
- select 'install from VSIX...'
- select vsix file, and reopen vscode
- edit a lg file, try some features.
- input `LG live test` in `F1` space, try lgfile webview test

# how to use for developer
- into LGvscodeExt folder
- `npm install` to install packages
- `npm run build`
- press `F5` to debug
- open lg file to debug
- reference doc: [vscode extension](https://code.visualstudio.com/api/language-extensions/overview)

# features show
#### [Syntax Highlight](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide)
- Keyword
- Template name and parameters
- Template reference name and parameters
- Expression
- Multiline text
- Comments
- Buildin function name and parameters
- Import

#### [Snippet](https://code.visualstudio.com/api/language-extensions/snippet-guide)
- Import
- Switch
- If
- Template

#### [Hover](https://code.visualstudio.com/api/language-extensions/programmatic-language-features#show-hovers)
- Template reference
- Buildin function

#### [Code Suggestion](https://code.visualstudio.com/api/language-extensions/programmatic-language-features#show-code-completion-proposals)
- Building function name
- Template reference
- File path for imports

#### [Definition](https://code.visualstudio.com/api/language-extensions/programmatic-language-features#show-definitions-of-a-symbol)
- Template definition

#### [Diagnostic](https://code.visualstudio.com/api/language-extensions/programmatic-language-features#provide-diagnostics)
- Error
- Warning

#### [Live Test Tool](https://code.visualstudio.com/api/extension-guides/webview)
- Template evaluation
- Inline evaluation

#### [Function and Method Signature](https://code.visualstudio.com/api/language-extensions/programmatic-language-features#help-with-function-and-method-signatures)
- Buildin function

#### others
- Automatic dash completion
- Actions on Errors (Auto import lg files)
