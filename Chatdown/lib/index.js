/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const fs = require('fs-extra');
const path = require('path');
const uuid = require('uuid');
const uuidv3 = require('uuid/v3');
const mime = require('mime-types');
const { ActivityTypes, AttachmentLayoutTypes } = require('botframework-schema');
const Activity = require('./serializable/activity');
const activityfield = require('./enums/activityField');
const instructions = require('./enums/instructions');
const activitytypes = require('./enums/activityType');
const { cardContentTypes, isCard } = require('./enums/cardContentTypes');
const ChannelAccount = require('./serializable/channelAccount');
const ConversationAccount = require('./serializable/conversationAccount');
const Attachment = require('./serializable/attachment');
const chalk = require('chalk');
const request = require('request-promise-native');

const NS = uuid();
// Matches [someActivityOrInstruction=value]
const commandRegExp = /(?:\[)(.*?)(?:])/i;
const configurationRegExp = /^(bot|user|channelId)(?:=)/;
const messageTimeGap = 2000;
let now = Date.now();
now -= now % 1000; // nearest second
let workingDirectory;

/**
 * Entry for dialog parsing.
 *
 * @param fileContents UTF-8 encoded bytes to parse.
 * @param args The k/v pair representing the configuration options
 * @returns {Promise<Array>} Resolves with an array of Activity objects.
 */
module.exports = async function readContents(fileContents, args) {
    // Resolve file paths based on the input file with a fallback to the cwd
    workingDirectory = args.in ? path.dirname(path.resolve(args.in)) : __dirname;
    const activities = [];
    const lines = fileLineIterator(fileContents.trim() + '\n');
    // Aggregate the contents of each line until
    // we reach a new activity.
    let aggregate = null;
    let currentActivity;
    // Read each line, derive activities with messages, then
    // return them as the payload
    let from;
    let recipient;
    for (let line of lines) {
        // signature for a new message
        if (configurationRegExp.test(line)) {
            const [optionName, value, ...rest] = line.trim().split('=');
            if (rest.length) {
                throw new Error('Malformed configurations options detected. Options must be in the format optionName=optionValue');
            }
            args[optionName.trim()] = value.trim();

            if (args.bot && args.user) {
                const botId = uuidv3(args.bot, NS);
                const userId = uuidv3(args.user, NS);
                args[args.bot.toLowerCase()] = args.bot;
                args[args.user.toLowerCase()] = args.user;
                args.botId = botId;
                args.userId = userId;
                args[botId] = new ChannelAccount({ id: botId, name: args.bot, role: 'bot' });
                args[userId] = new ChannelAccount({ id: userId, name: args.user, role: 'user' });
            }
            continue;
        }
        if (!args.bot || !args.user) {
            throw new ReferenceError('Cannot reference "bot" or "user"');
        }
        // If we've gotten to this point, we've defined
        // user, bot and other config options
        const { channelId = '1', user, bot } = args;
        const newMessageRegEx = new RegExp(`^(${user}|${bot}|bot|user):`, 'i');
        if (newMessageRegEx.test(line)) {
            // Complete the previous activity
            if (currentActivity) {
                currentActivity.text = currentActivity.text ? currentActivity.text.trim() : null;
                activities.push(currentActivity);
            }
            const fromId = args[newMessageRegEx.exec(line)[1].toLowerCase()];
            const fromChannelAccountId = fromId.toLowerCase() === args.bot.toLowerCase() ? args.botId : args.userId;
            const recipientChannelAccountId = fromId.toLowerCase() === args.bot.toLowerCase() ? args.userId : args.botId;

            from = args[fromChannelAccountId];
            recipient = args[recipientChannelAccountId];

            // Start the new activity
            currentActivity = createActivity({ recipient, from, channelId });
            currentActivity.timestamp = getIncrementedDate();

            // Trim off the user or bot and continue since
            // this line may still have a message or other
            // activities to parse.
            // e.g. Joe: Hello! [delay:1000] becomes Hello! [delay:1000]
            aggregate = line.trim().replace(newMessageRegEx, '');
        } else {
            // Not a new message but could contain
            // an activity on the line by itself.
            aggregate = line;
        }

        // signature for an activity that contains a type other than
        // message with or without arguments. e.g. [delay:3000]
        if (commandRegExp.test(aggregate)) {
            const newActivities = await readActivitiesFromAggregate(aggregate, currentActivity, recipient, from, channelId);
            if (newActivities) {
                activities.push(...newActivities);
                aggregate = null;
            }
        }
        else {
            currentActivity.text += (aggregate !== null ? aggregate : line).trim() + '\n';
        }
    }
    // We've run out of lines but may still have
    // an activity waiting.
    if (currentActivity) {
        if (currentActivity.text.endsWith('\n')){
            currentActivity.text = currentActivity.text.slice(0, -1);
        }
        activities.push(currentActivity);
    }
    return activities;
};

/**
 * Reads activities from a text aggregate. Aggregates
 * form when multiple activities occur in the context of a
 * single participant as is the case for attachments.
 *
 * @param {string} aggregate The aggregate text to derive activities from.
 * @param {Activity} currentActivity The Activity currently in context
 * @param {string} recipient The recipient of the Activity
 * @param {string} from The sender of the Activity
 * @param {string} channelId The id of the channel
 *
 * @returns {Promise<*>} Resolves to the number of new activities encountered or null if no new activities resulted
 */
async function readActivitiesFromAggregate(aggregate, currentActivity, recipient, from, channelId) {
    const newActivities = [];
    commandRegExp.lastIndex = 0;
    let result;
    while ((result = commandRegExp.exec(aggregate))) {
        // typeOrField should always be listed first
        let match = result[1]; // result[] doesn't have [] on it
        let split = match.indexOf('=');
        let typeOrField = split > 0 ? match.substring(0, split).trim() : match.trim();
        let rest = (split > 0) ? match.substring(split + 1).trim() : undefined;
        const type = activitytypes[typeOrField.toLowerCase()];
        const field = activityfield[typeOrField.toLowerCase()];
        const instruction = instructions[typeOrField.toLowerCase()];
        // This isn't an activity - bail
        if (!type && !field && !instruction) {
            // skip unknown tag
            console.error(chalk.red.bold(`skipping unknown tag ${result[0]}`));
            aggregate = aggregate.replace(`${result[0]}`, '');
            continue;
        }
        // Indicates a new activity -
        // As more activity types are supported, this should
        // become a util or helper class.
        if (type) {
            // We have encountered a new activity but
            // may have a fragment of a message to append
            // e.g. aggregate = "oh sure, I think I found something...[Typing][Delay:3000]"
            // we hit on [Typing] but need to append "oh sure, I think I found something..."
            // to the message.
            const index = aggregate.indexOf(`[${result[1]}]`);
            (currentActivity.text || (currentActivity.text = '')).concat(`\n${aggregate.substr(0, index).trim()}`);
            currentActivity = createActivity({ type, recipient, from, channelId });
            newActivities.push(currentActivity);
        }

        let delay = messageTimeGap;

        if (instruction) {
            switch (instruction) {
                case instructions.delay:
                    delay = parseInt(rest);
                    break;
            }
        }
        currentActivity.timestamp = getIncrementedDate(delay);

        if (field) {
            // As more activity fields are supported,
            // this should become a util or helper class.
            switch (field) {
                case activityfield.attachment:
                    await addAttachment(currentActivity, rest);
                    break;
                case activityfield.attachmentlayout:
                    addAttachmentLayout(currentActivity, rest);
                    break;
            }
        }
        // Trim off this activity or activity field and continue.
        aggregate = aggregate.replace(`[${result[1]}]`, '');
        commandRegExp.lastIndex = 0;
    }
    // If we have text left on this line after extracting
    // all instructions or activities, treat it like a message fragment.
    if (aggregate) {
        currentActivity.text += aggregate.trim();
    }
    return newActivities.length ? newActivities : null;
}

function addAttachmentLayout(currentActivity, rest) {
    if (rest && rest.toLowerCase() == AttachmentLayoutTypes.Carousel)
        currentActivity.attachmentLayout = AttachmentLayoutTypes.Carousel;
    else if (rest && rest.toLowerCase() == AttachmentLayoutTypes.List)
        currentActivity.attachmentLayout = AttachmentLayoutTypes.List;
    else
        console.error(`AttachmentLayout of ${rest[0]} is not List or Carousel`);
}

/**
 * Adds an attachment to the activity. If a mimetype is
 * specified, it is used as is. Otherwise, it is derived
 * from the file extension.
 *
 * @param {Activity} activity The activity to add the attachment to
 * @param {*} contentUrl contenturl
 * @param {*} contentType contentType
 *
 * @returns {Promise<number>} The new number of attachments for the activity
 */
async function addAttachment(activity, arg) {
    let parts = arg.trim().split(' ');
    let contentUrl = parts[0].trim();
    let contentType = (parts.length > 1) ? parts[1].trim() : undefined;
    if (contentType) {
        contentType = contentType.toLowerCase();
        if (cardContentTypes[contentType])
            contentType = cardContentTypes[contentType];
    }
    else {
        contentType = mime.lookup(contentUrl) || cardContentTypes[path.extname(contentUrl)];

        if (!contentType && contentUrl && contentUrl.indexOf('http') == 0) {
            let options = { method: 'HEAD', uri: contentUrl };
            let response = await request(options);
            contentType = response['content-type'].split(';')[0];
        }
    }

    const charset = mime.charset(contentType);

    // if not a url
    if (contentUrl.indexOf('http') != 0) {
        // read the file
        let content = await readAttachmentFile(contentUrl, contentType);
        // if it is not a card
        if (!isCard(contentType) && charset !== 'UTF-8') {
            // send as base64
            contentUrl = `data:${contentType};base64,${new Buffer(content).toString('base64')}`;
            content = undefined;
        } else {
            contentUrl = undefined;
        }
        return (activity.attachments || (activity.attachments = [])).push(new Attachment({ contentType, contentUrl, content }));
    }
    // send as contentUrl
    return (activity.attachments || (activity.attachments = [])).push(new Attachment({ contentType, contentUrl }));
}

/**
 * Utility function for reading the attachment
 *
 * @param fileLocation
 * @param contentType
 * @returns {*}
 */
async function readAttachmentFile(fileLocation, contentType) {
    let resolvedFileLocation = path.join(workingDirectory, fileLocation);
    let exists = fs.pathExistsSync(resolvedFileLocation);

    // fallback to cwd
    if (!exists) {
        resolvedFileLocation = path.resolve(fileLocation);
    }
    // Throws if the fallback does not exist.
    if (contentType.includes('json') || isCard(contentType)) {
        return fs.readJsonSync(resolvedFileLocation);
    } else {
        return fs.readFileSync(resolvedFileLocation);
    }
}

/**
 * Utility for creating a new serializable Activity.
 *
 * @param {ActivityTypes} type The Activity type
 * @param {string} to The recipient of the Activity
 * @param {string} from The sender of the Activity
 * @param {string} channelId The id of the channel
 * @returns {Activity} The newly created activity
 */
function createActivity({ type = ActivityTypes.Message, recipient, from, channelId }) {
    const activity = new Activity({ from, recipient, type, text: '', id: uuid() });
    activity.conversation = new ConversationAccount({ id: channelId });
    return activity;
}

function getIncrementedDate(byThisAmount = messageTimeGap) {
    return new Date(now += +byThisAmount).toISOString();
}

/**
 * Generator producing a well-known Symbol for
 * iterating each line in the UTF-8 encoded string.
 *
 * @param {string} fileContents The contents containing the lines to iterate.
 */
function* fileLineIterator(fileContents) {
    const reg = /(.+)*(?:\s)+/g; // take the whole line except the delimiter
    let parts;
    while ((parts = reg.exec(fileContents))) {
        yield parts[1];
    }
}
