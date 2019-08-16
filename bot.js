const fs = require('fs');

const rawData = fs.readFileSync('smb-data.json');
const smbData = JSON.parse(rawData);

function randomStage(game) {
  // Input: stages, a list of SMBStage objects.
  // Output: random stage from Stages.
  game = game.toUpperCase();

  const levelList = [];
  smbData.forEach(function(item) {
    if (item.game.toUpperCase() == game) {
      levelList.push(item); 
    }
  });

  return levelList[Math.floor(Math.random() * Object.keys(levelList).length)];
}

function getSMBLevelFromID(gameName, levelID) {
  // Input: game (from SMB1, SMB2), level number in form:
    //B01, B02, ... 
    //BE01, BE02, ...
    //A01, A02, ... 
    //AE01, AE02, ...
    //E01, E02, ... 
    //EE01, EE02, ...
    //M01, M02, ...
  // Output: Level details from that level.

  // check proper formatting using regex before running query

  const game = gameName.toUpperCase();
  const level = levelID.toUpperCase();

  const levelConversions = {
    'B': 'beginner', 
    'BE': 'beginnerExtra', 
    'A': 'advanced', 
    'AE': 'advancedExtra', 
    'E': 'expert', 
    'EE': 'expertExtra', 
    'M': 'master', 
    'ME': 'masterExtra', 
    'S': 'story', 
  };

  const levelDifficulty = level.length == 4 ? levelConversions[level.substr(0, 2)] : levelConversions[level.substr(0, 1)];
  const levelNumber = level.length == 4 ? parseInt(level.substr(2, 2)) : parseInt(level.substr(1, 2));

  let foundItem = undefined;

  // search is done by going through each element in smbData and then returning the smbData that matches it
  smbData.forEach(function(item) {
    if (item.game.toUpperCase() == game &&
        item.difficulty == levelDifficulty &&
        item.level == levelNumber) {
      foundItem = item;
    }
  });
  
  return foundItem;
}

function getSMBLevelFromName(game, levelName) {
  // Input: level name
  // Output: List of level details from that level name.

  // search is done by going through each element in smbData and then returning the smbData that matches it 

  const levels = [];
  smbData.forEach(function(item) {
    if (item.game.toUpperCase() == game.toUpperCase() &&
        item.name.toUpperCase().includes(levelName.toUpperCase())) {
      levels.push(item);
    }
  });

  return levels.length == 0 ? [] : levels;
}

function formatData(item) {
  // Input: SMBStage object
  // Output: String representation of the SMBStage object.

  // IIRC a SMBLevel has the following arguments that matter:
    // game: 
    // difficulty: 
    // world: 
    // level: 
    // name: 
    // picture: 

  let itemString = '\n';
  itemString = itemString + `Game: ${item.game.toUpperCase()}\n`;

  // converting difficulty to look nicer when output
  const difficultyConversion = {
    'beginner': 'Beginner', 
    'beginnerExtra': 'Beginner Extra', 
    'advanced': 'Advanced', 
    'advancedExtra': 'Advanced Extra', 
    'expert': 'Expert', 
    'expertExtra': 'Expert Extra', 
    'master': 'Master', 
    'masterExtra': 'Master Extra', 
    'story': 'Story', 
  };
  itemString = itemString + `Difficulty: ${difficultyConversion[item.difficulty]}\n`;

  if (item.world != undefined) {
    itemString = itemString + `World: ${item.world}\n`;
  }
  itemString = itemString + `Level: ${item.level}\n`;
  itemString = itemString + `Name: ${item.name}\n`;
  return itemString;
}

////////////////////////////////////////////////////////////////////////////////
// Bot Stuff
////////////////////////////////////////////////////////////////////////////////

const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');

client.on('ready', () => {
  // Input: none
  // Output: Message which affirms connectivity.
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  // Input: message object
  // Output: dependent on query, does different things. See documentation 
  // here: https://pastebin.com/ACpWB2YC

  console.log(`Message received from ${msg.author} at ${msg.createdAt}`);

  if (msg.content.startsWith('!randomStage')) {
    // Random stage - only 1 argument needed
    let argList = msg.content.split(' ');
    argList = argList.slice(1, argList.length);

    // Checking if arguments are valid 
    if (argList.length == 1 && 
        ['SMB1', 'SMB2'].includes(argList[0].toUpperCase())) {

      // feed arguments to function
      const item = randomStage(argList[0]);
      console.log(item);

      // make the message using formatData,
      // then add attachment of image from the URL of the item.
      msg.reply(formatData(item));
      const pictureAttachment = new Discord.Attachment(`./${item.picture}`);
      const embed = {
        image: {
          url: `attachment://${item.picture}`,
        }
      };
      msg.channel.send({files: [pictureAttachment], embed: embed});
    }
  }

  else if (msg.content.startsWith('!getStageFromID')) {
    // Get stage from ID - 2 arguments needed
    let argList = msg.content.split(' ');
    argList = argList.slice(1, argList.length);

    // Checking if arguments are valid 
    if (argList.length == 2 && 
        ['SMB1', 'SMB2'].includes(argList[0].toUpperCase()) &&
        argList[1].match(/[A-Za-z]{1,2}\d{2}/)) {

      // feed arguments to function
      const item = getSMBLevelFromID(argList[0], argList[1]);

      // make the message using formatData,
      // then add attachment of image from the URL of the item.
      if (item == undefined) {
        msg.reply('No levels found in database with that ID.');
        console.log('No levels found in database with that ID.');
      }

      else {
        // make the message using formatData,
        // then add attachment of image from the URL of the item.
        msg.reply(formatData(item));
        console.log(item);

        const pictureAttachment = new Discord.Attachment(`./${item.picture}`);
        const embed = {
          image: {
            url: `attachment://${item.picture}`,
          }
        };
        msg.channel.send({files: [pictureAttachment], embed: embed});
      }
    }
  }

  else if (msg.content.startsWith('!getStageFromName')) {
    // Get stage from Name - 2+ arguments needed
    let argList = msg.content.split(' '); 
    argList = argList.slice(1, argList.length);

    // Checking if arguments are valid 
    if (argList.length >= 2 && 
        ['SMB1', 'SMB2'].includes(argList[0].toUpperCase())) {

      // get all array things past index 1 and merge them to form 1 word
      let name = argList.slice(1, argList.length);
      name = name.join(' ');

      // feed arguments to function
      const itemList = getSMBLevelFromName(argList[0], name);

      // make the message using formatData,
      // then add attachment of image from the URL of the item.

      // this is done in a loop on the off-chance that more than one level is 
      // received.

      if (itemList.length == 0) {
        msg.reply('No levels found in database with that name.');
        console.log('No levels found in database with that name.');
      }
      else {
        // if you do a dumb search (like a 1 constter search), it shouldn't print 
        // every possible search query to the server.
        // this controls that - if the query returns more than 5 elements, it 
        // will only print 5 elements, and not print any pictures to go with it.
        // this should help with bandwidth concerns.
        const endPoint = itemList.length > 5 ? 5 : itemList.length;
        const endPointFlag = endPoint == 5 ? true : false;
        if (endPointFlag) {
          msg.reply('Only 5 most relevant items shown. Pictures will not be embedded.');
        }

        // for each photo found in itemList, up to endPoint, print formatted
        // stage data and embed pictures to go with it, unless endpointflag is
        // set to true.
        for (let i = 0; i < endPoint; i++) {
          msg.reply(formatData(itemList[i]));
          console.log(itemList[i]);
          
          if (!endPointFlag) {
            const pictureAttachment = new Discord.Attachment(`./${itemList[i].picture}`);
            const embed = {
              image: {
                url: `attachment://${itemList[i].picture}`,
              }
            };
            msg.channel.send({files: [pictureAttachment], embed: embed});
          }
        }

      }
    }
  }
});

client.login(auth.token); 