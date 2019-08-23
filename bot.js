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

  let foundItem = undefined;

  // if regex is of form SWWXX where WW is world # and XX is stage number:
  if (level.startsWith('S')) {
    const levelDifficulty = 'story';
    const worldNumber = level.substr(1, 2);
    const levelNumber = level.substr(3, 2);

    // search is done by going through each element in smbData and then returning the smbData that matches it
    smbData.forEach(function(item) {
      if (item.game.toUpperCase() == game &&
          item.difficulty == levelDifficulty &&
          item.level == levelNumber &&
          item.world == worldNumber) {
        foundItem = item;
      }
    });

  }
  else {
    const levelDifficulty = level.length == 4 ? levelConversions[level.substr(0, 2)] : levelConversions[level.substr(0, 1)];
    const levelNumber = level.length == 4 ? parseInt(level.substr(2, 2)) : parseInt(level.substr(1, 2));

    // search is done by going through each element in smbData and then returning the smbData that matches it
    smbData.forEach(function(item) {
      if (item.game.toUpperCase() == game &&
          item.difficulty == levelDifficulty &&
          item.level == levelNumber) {
        foundItem = item;
      }
    });
  }

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

const request = require('request-promise');
// const requestDebug = require('request-debug');

// if (process.env.NODE_ENV !== 'production') {
// 	requestDebug(request);
// }

function getTimes(leaderboard) {
    // Input: JSON file
    // Output: All run objects from the JSON file with a date greater than yesterday's date.

    // let yesterday = new Date('July 22, 2019')

    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let runs = [];

    // go through each run in the provided leaderboard
    for (const item of leaderboard.data.runs) {
        const submitDate = new Date(item.run.submitted);
        const verifyDate = item.run.status['verify-date'] ? new Date(item.run.status['verify-date']) : undefined;

        //defer to verifydate unless null, in which case defer to submitdate

        if (verifyDate && verifyDate >= yesterday) {
            runs.push(item.run);
        }
        else if (submitDate >= yesterday) {
            runs.push(item.run);
        }
    }

    return runs;
}

async function requestSMBLeaderboards() {
    // Input: None.
    // Output: list of all runs from leaderboards with time greater than yesterday.

    const smb1Leaderboards = ['Beginner', 'Beginner-Ex', 'Advanced', 'Advanced-Ex', 'Expert', 'Master', 'All_Difficulties'];
    const smb2Leaderboards = ['Story_Mode', 'Beginner', 'Advanced', 'Expert', 'Master', 'All_Difficulties'];
    let newTimes = [];

    // go through each category in the provided leaderboard
    for (const item of smb1Leaderboards) {
        let leaderboardTimes = [];
        let lb = await request(`https://www.speedrun.com/api/v1/leaderboards/supermonkeyball/category/${item}`);

        // console.log(`Leaderboard obtained from ${item}`);
        const leaderboard = JSON.parse(lb);
        leaderboardTimes = getTimes(leaderboard);

        newTimes = newTimes.concat(leaderboardTimes)
    }

    // go through each category in the provided leaderboard
    for (const item of smb2Leaderboards) {
        let leaderboardTimes = [];
        let lb = await request(`https://www.speedrun.com/api/v1/leaderboards/supermonkeyball2/category/${item}`);

        // console.log(`Leaderboard obtained from ${item}`);
        const leaderboard = JSON.parse(lb);
        leaderboardTimes = getTimes(leaderboard);

        newTimes = newTimes.concat(leaderboardTimes)
    }

    return newTimes;
}

async function generateNewTimes() {
  // Input: none
  // Output: All users, categories, and times from the past day.
    let runs = await requestSMBLeaderboards();

    let formattedRuns = [];
    for (const item of runs) {
        let userData = await request(`https://www.speedrun.com/api/v1/users/${item.players[0].id}`);
        userData = JSON.parse(userData);
        const username = userData.data.names.international;

        let gameData = await request(`https://www.speedrun.com/api/v1/games/${item.game}`)
        gameData = JSON.parse(gameData);
        const game = gameData.data.names.international;

        let categoryData = await request(`https://www.speedrun.com/api/v1/categories/${item.category}`);
        categoryData = JSON.parse(categoryData);
        const category = categoryData.data.name;

        let time = item.times.primary_t;
        const hours = Math.floor(time / 3600).toString().padStart(2, "0");
        const minutes = Math.floor(time / 60).toString().padStart(2, "0");
        const seconds = (time % 60).toString().padStart(2, "0");

        formattedRuns.push({'username': username, 'game': game, 'category': category, 'time': {'h': hours, 'm': minutes, 's': seconds}});
    }

  return formattedRuns;
}

////////////////////////////////////////////////////////////////////////////////
// Bot Stuff
////////////////////////////////////////////////////////////////////////////////

const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');

async function checkPBs() {
  // Input: None.
  // Output: Messages to specific channel which state PBs done in the past day.
  console.log(`Checking for PBs at ${new Date()}`);

  const newTimes = await generateNewTimes();
  for (const item of newTimes) {
    const sentence = `In ${item.game}, ${item.username} got a new PB of ${item.time.h}:${item.time.m}:${item.time.s} in the ${item.category} category!`
    client.channels.get('603335654415400961').send(sentence);
    // SMB PB brag
    // client.channels.get('614275762102468618').send(sentence);
    // BIS PB brag
  }

  setTimeout(checkPBs, 86400000)
}

client.on('ready', () => {
  // Input: none
  // Output: Message which affirms connectivity.
  console.log(`Logged in as ${client.user.tag}!`);
  checkPBs()
});

client.on('message', msg => {
  // Input: message object
  // Output: dependent on query, does different things. See documentation 
  // here: https://pastebin.com/ACpWB2YC

  if (msg.content.startsWith('!about')) {
    console.log(`Message received from ${msg.author} at ${msg.createdAt}`);
    console.log(`About message requested.`)
    msg.reply(`Hi! I'm a Discord bot used to improve QOL for the members of the Super Monkey Ball speedrunning Discord. My functions can be found here: https://pastebin.com/ACpWB2YC`);
  }

  else if (msg.content.startsWith('!randomStage')) {
    console.log(`Message received from ${msg.author} at ${msg.createdAt}`);

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
    console.log(`Message received from ${msg.author} at ${msg.createdAt}`);

    // Get stage from ID - 2 arguments needed
    let argList = msg.content.split(' ');
    argList = argList.slice(1, argList.length);

    // Checking if arguments are valid 
    if (argList.length == 2 && 
        ['SMB1', 'SMB2'].includes(argList[0].toUpperCase()) &&
        (argList[1].match(/[ABEMabem]{1,2}\d{2}/) || 
        argList[1].match(/[Ss]\d{4}/))) {

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
    console.log(`Message received from ${msg.author} at ${msg.createdAt}`);

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
        // if you do a dumb search (like a 1 letter search), it shouldn't print 
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