# MSBot Command Line tool

[![npm version](https://badge.fury.io/js/msbot.svg)](https://badge.fury.io/js/msbot)

The MSBot tool is a command line tool to create and manipulate a bot resources via a .bot file. 


# What is a .bot file?

Bots usually consume lots of diverse services, such as [LUIS.ai](https://luis.ai), or [QnaMaker.ai](https://qnamaker.ai). When you are developing a bot, there is no uniform place to store the the metadata about the services that are in use.  This prevents us from building tooling that looks at a bot as a whole.

To address this problem, we have created a **.bot file** to act as the place to unify all of these services together to enable tooling.  For example, the [new v4 Bot Framework Emulator](https://github.com/Microsoft/BotFramework-Emulator/releases) uses a the .bot file to create a unified view over the connected services your bot consumes.  

Via the .bot file, you can register services like:

* **Localhost** local debugger endpoints
* [**Azure Bot Service**](https://azure.microsoft.com/en-us/services/bot-service/) Azure Bot Service registrations.
* [**LUIS.AI**](https://www.luis.ai/) Language Understanding (LUIS) allows your application to understand what a person wants in their own words. 
* [**QnA Maker**](https://qnamaker.ai/) Build, train and publish a simple question and answer bot based on FAQ URLs, structured documents or editorial content in minutes.
* [**Dispatcher**](https://github.com/Microsoft/botbuilder-tools/tree/master/Dispatch) models for dispatching across heterogeneous sources.

## Prerequisite

- [Node.js](https://nodejs.org/) version 8.5 or higher

# Installation

To install using npm:

```shell
npm install -g msbot
```

This will install msbot into your global path.

# Usage

## Creating a bot file

To create a bot file, run:

```shell
msbot init [options]
```

It will ask you for the name of the bot and the local endpoint for it and will create the *name.bot* file.

Arguments:

| Option               | Description    |
| -------------------- | --------------- |
| -n, --name <botname> | name of the bot |
| -d, --description <description>  |(optional) description of the bot|
| -e, --endpoint <endpoint>        |(optional) local endpoint for the bot|
|-q, --quiet                      |suppress prompts|
|-h, --help                       |output usage information|

Example:

```shell
msbot init --name TestBot --endpoint http://localhost:9499/api/messages
```



## Connecting Your Bot to a Service

To connect your bot to a service you run 

```shell
msbot connect [command]
```

Where the command is one of the services

| Command | Description |
| ------ | ----------- |
| azure       |connect your bot to an Azure Bot Service registration|
|    localhost|   connect your bot to a localhost endpoint|
|luis        |connect your bot to a LUIS application |
| qna         |connect your bot to a QnA knowledge base|
|help [cmd]  |display help for [cmd]|

### Connecting to a Localhost Service  

To connect your bot to localhost server:

```shell
msbot connect localhost [options]
```

With the following options

| Option                       | Description                                                  |
| ---------------------------- | ------------------------------------------------------------ |
| --secret <secret>            | (Required) bot file secret password for encrypting service secrets |
| -n, --name <name>            | name of the Azure Bot Service                                |
| -a, --appId  <appid>         | (Required) Microsoft AppId for the Azure Bot Service         |
| -p, --appPassword <password> | (Required) Microsoft app password for the Azure Bot Service   |
| -e, --endpoint <endpoint>    | (Required) endpoint for the bot using the MSA AppId          |
| -b, --bot <path>             | (Optional) path to bot file.  If omitted, local folder will look for a .bot file. |
| -h, --help                   | output usage information                                     |

An example:

```shell
msbot connect localhost --secret EncryptItPlease --name "Debug TestBot" --appId "562789d2-a344-445c-b4b1-41e8583f9f72" --appPassword 1abHDN3421342 --endpoint http://localhost:9090/api/messages
```

### Connecting to Azure Bot Service  

To connect your bot to Azure Bot Service:

```shell
msbot connect azure [options]
```

Options:

|Option | Description|
| ------ | ----------- |
|-b, --bot <path>             | (Optional) path to bot file.  If omitted, local folder will look for a .bot file |
|--secret <secret>             |(Required) bot file secret password for encrypting service secrets|
|-i, --id <id>                 |(Required) Azure Bot Service bot ID|
|-n, --name <name>             |name of the Azure Bot Service|
|-a, --appId  <appid>          |(Required) Microsoft AppId for the Azure Bot Service|
|-p, --appPassword <password>  |(Required) Microsoft app password for the Azure Bot Service|
|-e, --endpoint <endpoint>     |(Required) endpoint for the bot using the MSA AppId|
|-h, --help                    |output usage information|

An example:
```shell
msbot connect azure --secret EncryptItPlease --id testbot --name "Test Bot" --appId "562789d2-a344-445c-b4b1-41e8583f9f72" --appPassword 1abHDN3421342 --endpoint https://testbot.azurewebsites.net/api/messages
```



### Connecting to LUIS Application

To connect your bot to a LUIS application:

```shell
msbot connect luis [options]
```

With the following options:

| Option                       | Description                                                  |
| ---------------------------- | ------------------------------------------------------------ |
|-b, --bot <path>           | (Optional) path to bot file.  If omitted, local folder will look for a .bot file |
| --secret <secret>         | (Required) bot file secret password for encrypting service secrets |
| -n, --name <name>         | name of the LUIS application                                |
| -a, --appId  <appid>      | (Required) application ID for the LUIS application|
|-v, --version <version>        |version for the LUIS App, (example: 0.1)|
|  --authoringKey <authoringkey>  |(Required) authoring key for authoring LUIS models via the authoring API |
| -h, --help                   | output usage information|

Here is an example invocation:

```shell
msbot connect luis --secret EncryptItPlease --name "My Luis Model" --appId "562789d2-a344-445c-b4b1-41e8583f9f72" --version 0.1 --authoringKey "6e5adf8b-88ea-46f3-ba2c-c97ecacd4304"
```



### Connecting to QnA Maker Knowledge base

To connect your bot to a QNA maker knowledge base:

```shell
msbot connect qna [options]
```

With the following options:

| Option                        | Description                                                  |
| ----------------------------- | ------------------------------------------------------------ |
| -b, --bot <path>              | (Optional) path to bot file.  If omitted, local folder will look for a .bot file |
| --secret <secret>             | (Required) bot file secret password for encrypting service secrets |
| -n, --name <name>             | name of the QnA knowledge base                                 |
| -k, --kbId <kbId>                    |QnA knowledge base Id|
| -e, --environment <environment> | QnA environment, default is prod. | 
| --subscriptionKey <subscriptionKey> | SubscriptionKey for accessing the QnA service|
| -h, --help                    | output usage information                                     |

Here is an example invocation:

```shell
msbot connect qna --secret EncryptItPlease --name "QnA Sauce" --kbId "cfbc14a3-9f69-4fb1-8882-e6f333691a2a" --subscriptionKey "cfbc14a3-9f69-4fb1-8882-e6f333691a2a"
```

### Connecting to Bot Dispatch

To connect your bot to bot dispatch definition:

```shell
msbot connect dispatch [options]
```

Options:

|Option | Description|
| ------ | ----------- |
|-b, --bot <path>                     | path to bot file.  If omitted, local folder will look for a .bot file|
|--secret <secret>                    | bot file secret password for encrypting service secrets|
|-n, --name <name>                    | name for the dispatch|
|-a, --appId <appid>                  | LUIS AppId for the dispatch app|
|-v, --version <version>          | version for the dispatch app (example: 0.1)|
|--subscriptionKey <subscriptionKey>  | subscription key used for querying the dispatch model|
|--authoringKey <authoringkey>        | authoring key for using manipulating the dispatch model via the LUIS authoring API|
|--stdin                              | arguments are passed in as JSON object via stdin|
|--input <dispatchfile>               | arguments passed in as path to arguments in JSON format|

Here is an example invocation:
```shell
msbot connect dispatch --input my.dispatch
```

## Listing connected services

To access the list of connected services:

```shell
msbot list [options]
```

Options:

| Option                        | Description                                                  |
| ----------------------------- | ------------------------------------------------------------ |
| -b, --bot <path>   |path to bot file.  If omitted, local folder will look for a .bot file|
|--secret <secret> | bot file secret password for encrypting service secrets|
|-h, --help        | output usage information|

If you omit the secret, you will get the configured services with the secrets encrypted.  If you pass the secret password, you will see the secrets decrypted.

## Disconnecting a service
You can remove a service by using the disconnect command:

```shell
msbot disconnect [serviceid_or_name]
```
Where *serviceid_or_name* is the id or name of the connected service.
Example using a name:
```shell
msbot disconnect MyLuisApp
```
Example using ID:
```shell
msbot disconnect "339411fa-ac8d-47ad-8d92-4b083a2c5305"
```

# Export from services to files

To export from all of your services in a form that can be imported later.

```shell
msbot export [options]
```

This will result in exports from all of your services being stored in a directory with the name of your bot file.

Options:

| Option                        | Description                                                  |
| ----------------------------- | ------------------------------------------------------------ |
|   -b, --bot <path>  |   path to bot file.  If omitted, local folder will look for a .bot file |
|    --secret <secret>   | bot file secret password for encrypting service secrets |
|   -o, --output <path> |  output directory.  If not present will default to bot file directory.|
|    -h, --help          | output usage information|

# Import from files to services

Recreate all of your bot services from exported files. 

```shell
msbot import <importDir> [options]
```

| Option                        | Description                                                  |
| ----------------------------- | ------------------------------------------------------------ |
|   <importDir>                               | Directory with export files.|
|    -a, --authoringKey <authoringkey>        | authoring key for using manipulating LUIS apps via the authoring API (See http://aka.ms/luiskeys for help)|
|    -r --region <region>                     | LUIS authoring region like "westus" which is the default.|
|    --subscriptionKey <subscriptionKey>            | Key for calling published LUIS endpoint, default is authoringKey|
|    --publishedEndpoint <publishedEndpoint>  | How to call published LUIS model, default is authoring region|
|    -s, --subscriptionKey <subscriptionKey>  | Azure Cognitive Service subscriptionKey/accessKey for calling the QnA management API (from azure portal)|
|    --secret <secret>                        | bot file secret password for encrypting service secrets|
|    -o, --output <path>                      | output directory for new .bot file.  If not present will default to current directory.|
|    -h, --help                               | output usage information|


# Bot Secrets

It is useful for tools like the emulator to have secure access to keys it needs to work with the services that are connected to the bot.  The MSBot tool supports this by allowing you to specify a **secret** which is a password that is used to encrypt/decrypt secure keys in the .bot file.

Any command which accepts the `--secret` option has data which needs to be encrypted with the secret. 
This allows you to check in a .bot file into a public repo safely and only need the secret to unlock all of the keys your bot uses.

> NOTE: You should make sure that you use the same secret when adding all of the services.
