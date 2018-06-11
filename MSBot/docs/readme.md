﻿# MSBot Command Line tool

The msbot tool is a command line tool to create and manipulate a bot resources via a .bot. 


# What is a .bot file?

Bots usually consume lots of diverse services such as LUIS.ai, or QnMaker.com. When you are developing a bot there is no uniform place to store the the metadata about the services that are in use.  This prevents us from building tooling that looks at a bot as a whole.

To address this problem we have created a **.bot file** to act as the place to unify all of these services together to enable tooling.  For example: the new Bot Framework Emulator uses a the .bot file to create a unified view over the connected services your bot consumes.  

Via the .bot file you can register services like:

* **Localhost** local debugger endpoints
* **Azure Bot Service** Azure Bot Service registrations
* **LUIS.AI** language understanding models
* **QnA Maker** knowledge bases
* **Dispatcher** models for dispatching across heterogeneous sources
* *etc*


# Installation

To install simply invoke npm 

```shell
npm install -g msbot
```

This will install msbot into your global path.

# Usage

## Creating a bot file

To create a bot file you run 

```shell
msbot init [options]
```

It will ask you the name of the bot and the local endpoint for it and create the *name.bot* file.

Arguments

| Option               | Description    |
| -------------------- | --------------- |
| -n, --name <botname> | name of the bot |
| -d, --description <description>  |(optional) description of the bot|
| -e, --endpoint <endpoint>        |(optional) local endpoint for the bot|
|-q, --quiet                      |do not prompt|
|-h, --help                       |output usage information|

Example:

```shell
msbot init --name TestBot --endpoint http://localhost:9499/api/messages
```



## Connecting your bot to a service

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
| qna         |connect your bot to a QnA Knowledgebase|
|help [cmd]  |display help for [cmd]|

### Connecting to a Localhost service  

To connect your bot to localhost server you run

```shell
msbot connect localhost [options]
```

With the following options

| Option                       | Description                                                  |
| ---------------------------- | ------------------------------------------------------------ |
| --secret <secret>            | (Required) bot file secret password for encrypting service secrets |
| -n, --name <name>            | name of the azure bot service                                |
| -a, --appId  <appid>         | (Required) Microsoft AppId for the Azure Bot Service         |
| -p, --appPassword <password> | (Required)Microsoft app password for the Azure Bot Service   |
| -e, --endpoint <endpoint>    | (Required) endpoint for the bot using the MSA AppId          |
| -b, --bot <path>             | (Optional) path to bot file.  If omitted, local folder will look for a .bot file |
| -h, --help                   | output usage information                                     |

Here is an example invocation:

```shell
msbot connect localhost --secret EncryptItPlease --name "Debug TestBot" --appId "562789d2-a344-445c-b4b1-41e8583f9f72" --appPassword 1abHDN3421342 --endpoint http://localhost:9090/api/messages
```

### Connecting to Azure Bot Service  

To connect your bot to Azure Bot Service you run

```shell
msbot connect azure [options]
```

With the following options

|Option | Description|
| ------ | ----------- |
|-b, --bot <path>             | (Optional) path to bot file.  If omitted, local folder will look for a .bot file |
|--secret <secret>             |(Required) bot file secret password for encrypting service secrets|
|-i, --id <id>                 |(Required) Azure Bot Service bot id|
|-n, --name <name>             |name of the azure bot service|
|-a, --appId  <appid>          |(Required) Microsoft AppId for the Azure Bot Service|
|-p, --appPassword <password>  |(Required)Microsoft app password for the Azure Bot Service|
|-e, --endpoint <endpoint>     |(Required) endpoint for the bot using the MSA AppId|
|-h, --help                    |output usage information|

Here is an example invocation:
```shell
msbot connect azure --secret EncryptItPlease --id testbot --name "Test Bot" --appId "562789d2-a344-445c-b4b1-41e8583f9f72" --appPassword 1abHDN3421342 --endpoint https://testbot.azurewebsites.net/api/messages
```



### Connecting to LUIS Application

To connect your bot to a LUIS application you run

```shell
msbot connect luis [options]
```

With the following options

| Option                       | Description                                                  |
| ---------------------------- | ------------------------------------------------------------ |
|-b, --bot <path>              | (Optional) path to bot file.  If omitted, local folder will look for a .bot file |
| --secret <secret>            | (Required) bot file secret password for encrypting service secrets |
| -n, --name <name>            | name of the Luis application                                |
| -a, --appId  <appid>         | (Required) Application Id for the LUIS application|
|-v, --versionId <versionId>   |version for the LUIS App, (example: 0.1)|
|  --authoringKey <authoringkey>  |(Required) authoring key for authoring LUIS models via the authoring API |
| -h, --help                   | output usage information|

Here is an example invocation:

```shell
msbot connect luis --secret EncryptItPlease --name "My Luis Model" --appId "562789d2-a344-445c-b4b1-41e8583f9f72" --versionId 0.1 --authoringKey "6e5adf8b-88ea-46f3-ba2c-c97ecacd4304"
```



### Connecting to QnA Maker Knowledge base

To connect your bot to a QNA maker knowledge base you run

```shell
msbot connect qna [options]
```

With the following options

| Option                        | Description                                                  |
| ----------------------------- | ------------------------------------------------------------ |
| -b, --bot <path>              | (Optional) path to bot file.  If omitted, local folder will look for a .bot file |
| --secret <secret>             | (Required) bot file secret password for encrypting service secrets |
| -n, --name <name>             | name of the QnA knowledgebase                                 |
| -k, --kbId <kbId>                    |QnA Knowledgebase Id|
| -e, --environment <environment> | QnA environment, default is prod. | 
| --subscriptionKey <subscriptionKey> | SubscriptionKey for accessing the qna service|
| -h, --help                    | output usage information                                     |

Here is an example invocation:

```shell
msbot connect qna --secret EncryptItPlease --name "QnA Sauce" --kbId "cfbc14a3-9f69-4fb1-8882-e6f333691a2a" --subscriptionKey "cfbc14a3-9f69-4fb1-8882-e6f333691a2a"
```

### Connecting to Bot Dispatch

To connect your bot to bot dispatch definition you run

```shell
msbot connect dispatch [options]
```

With the following options

|Option | Description|
| ------ | ----------- |
|-b, --bot <path>                     | path to bot file.  If omitted, local folder will look for a .bot file|
|--secret <secret>                    | bot file secret password for encrypting service secrets|
|-n, --name <name>                    | name for the dispatch|
|-a, --appId <appid>                  | LUID AppId for the dispatch app|
|-v, --versionId <versionId>              | version for the dispatch app, (example: 0.1)|
|--publishedKey <publishedKey>  | subscription key used for querying the dispatch model|
|--authoringKey <authoringkey>        | authoring key for using manipulating the dispatch model via the LUIS authoring API|
|--stdin                              | arguments are passed in as JSON object via stdin|
|--input <dispatchfile>               | arguments passed in as path to arguments in JSON format|

Here is an example invocation:
```shell
msbot connect dispatch --input my.dispatch
```

## Listing connected services

To access the list of connected services you run

```shell
msbot list [options]
```

Where options are:

| Option                        | Description                                                  |
| ----------------------------- | ------------------------------------------------------------ |
| -b, --bot <path>   |path to bot file.  If omitted, local folder will look for a .bot file|
|--secret <secret> | bot file secret password for encrypting service secrets|
|-h, --help        | output usage information|

If you omit the secret, you will get the configured services with the secrets encrypted.  If you pass the secret password, you will see the secrets decrypted.

## Disconnecting a service
You can remove a service by using the disconnect command 

```shell
msbot disconnect [serviceid_or_name]
```
Where *serviceid_or_name* is the id or name of the connected service.
Example using name:
```shell
msbot disconnect MyLuisApp
```
Example using id:
```shell
msbot disconnect "339411fa-ac8d-47ad-8d92-4b083a2c5305"
```

## Exporting a bot
TBD

## Cloning a bot
TBD

# Bot Secrets

It is useful for tools like the emulator to have secure access to keys it needs to work with the services that are connected to the bot.  The MSBot tool supports this by allowing you to specify a **secret** which is a password that is used to encrypt/decrypt secure keys in the .bot file.

Any command which accepts the --secret option has data which needs to be encrypted with the secret. 

This allows you to check in a .bot file into a public repo safely, and only need the secret to unlock all of the keys your bot uses.

> NOTE: You should make sure that you use the same secret when adding all of the services.
