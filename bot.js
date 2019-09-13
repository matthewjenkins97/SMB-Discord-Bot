const DEBUG = true;

const fs = require('fs');
const request = require('request-promise');

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
  // B01, B02, ...
  // BE01, BE02, ...
  // A01, A02, ...
  // AE01, AE02, ...
  // E01, E02, ...
  // EE01, EE02, ...
  // M01, M02, ...
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

    // search is done by going through each element in smbData and then
    // returning the smbData that matches it
    smbData.forEach(function(item) {
      if (item.game.toUpperCase() == game &&
          item.difficulty == levelDifficulty &&
          item.level == levelNumber &&
          item.world == worldNumber) {
        foundItem = item;
      }
    });
  } else {
    const levelDifficulty = level.length == 4 ?
    levelConversions[level.substr(0, 2)] : levelConversions[level.substr(0, 1)];
    const levelNumber = level.length == 4 ?
    parseInt(level.substr(2, 2)) : parseInt(level.substr(1, 2));

    // search is done by going through each element in smbData and then
    // returning the smbData that matches it
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

  // search is done by going through each element in smbData and then returning
  // the smbData that matches it

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
  itemString = itemString +
  `Difficulty: ${difficultyConversion[item.difficulty]}\n`;

  if (item.world != undefined) {
    itemString = itemString + `World: ${item.world}\n`;
  }
  itemString = itemString + `Level: ${item.level}\n`;
  itemString = itemString + `Name: ${item.name}\n`;
  return itemString;
}

function getTimes(leaderboard) {
  // Input: JSON file
  // Output: All run objects from the JSON file with a date greater than
  // yesterday's date.

  // get yesterday's date
  yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const runs = [];

  // go through each run in the provided leaderboard
  for (const item of leaderboard.data.runs) {
    // get submit date and verify date and convert it to Date objects
    const submitDate = new Date(item.run.submitted);
    const verifyDate = item.run.status['verify-date'] ?
    new Date(item.run.status['verify-date']) : undefined;

    // if there are any times greater than yesterday, push them to runs list
    // defer to verifydate unless null, in which case defer to submitdate
    if (verifyDate && verifyDate >= yesterday) {
      runs.push({'run': item.run});
    } else if (submitDate >= yesterday) {
      runs.push({'run': item.run});
    }
  }

  return runs;
}

async function requestSMBLeaderboards() {
  // Input: None.
  // Output: list of all runs from leaderboards with time greater than
  // yesterday.

  // list of leaderboards per game, as well as links to each leaderboard on SRC
  // order: smb1, smb2, smbdx, t&r, adventure, bb, step & roll,
  // monkeyed ball 2, scrap651
  const links = [
    `https://www.speedrun.com/api/v1/leaderboards/supermonkeyball/category/`,
    `https://www.speedrun.com/api/v1/leaderboards/supermonkeyball2/category/`,
    `https://www.speedrun.com/api/v1/leaderboards/smbdeluxe/category/`,
    `https://www.speedrun.com/api/v1/leaderboards/touchandroll/category/`,
    `https://www.speedrun.com/api/v1/leaderboards/smbadventure/category/`,
    `https://www.speedrun.com/api/v1/leaderboards/bananablitz/category/`,
    `https://www.speedrun.com/api/v1/leaderboards/stepandroll/category/`,

    // ROM HACKS
    `https://www.speedrun.com/api/v1/leaderboards/smb2mb2/category/`,
    `https://www.speedrun.com/api/v1/leaderboards/smb651/category/`,
  ];

  // list of leaderboards per game, as well as links to each leaderboard on SRC
  // order: smb1, smb2, smbdx, t&r, adventure, bb, step & roll,
  // monkeyed ball 2, scrap651
  const leaderboards = [
    ['Beginner', 'Beginner-Ex', 'Advanced', 'Advanced-Ex',
      'Expert', 'Master', 'All_Difficulties'],
    ['Story_Mode', 'Beginner', 'Advanced', 'Expert', 'Master',
      'All_Difficulties'],
    ['Ultimate', 'Beginner', 'Advanced', 'Expert', 'Master',
      'Story_Mode'],
    ['All_Worlds', 'Main_Worlds_1-8', 'Extra_Worlds_9-12'],
    ['Story_Mode_Any', 'Story_Mode_100', 'Beginner',
      'Advanced', 'Expert', 'All_Difficulties'],
    ['All_Bosses', 'All_Worlds'],
    ['All_Worlds', 'Half_Marathon_Exercise',
      'Half_Marathon_Maniac', 'Full_Marathon'],

    // ROM HACKS
    ['Story_Mode', 'Beginner', 'Advanced', 'Expert', 'Master',
      'Ultimate', '270_Stages'],
    ['Story_Mode_All_Levels'],
  ];

  let newTimes = [];

  // go through each category in each leaderboards

  for (let i = 0; i < links.length; i++) {
    for (const item of leaderboards[i]) {
      let leaderboardTimes = [];

      console.log(links[i] + item);
      const lb = await request(links[i] + item);

      const leaderboard = JSON.parse(lb);
      leaderboardTimes = getTimes(leaderboard);

      newTimes = newTimes.concat(leaderboardTimes);
    }
  }

  return newTimes;
}

async function postNewTimes() {
  // Input: none
  // Output: All users, categories, and times from the past day.
  const runs = await requestSMBLeaderboards();

  const formattedRuns = [];
  for (const item of runs) {
    let userData = await
    request(`https://www.speedrun.com/api/v1/users/${item.run.players[0].id}`);
    userData = JSON.parse(userData);
    const username = userData.data.names.international;

    let gameData = await
    request(`https://www.speedrun.com/api/v1/games/${item.run.game}`);
    gameData = JSON.parse(gameData);
    const game = gameData.data.names.international;

    let categoryData = await
    request(`https://www.speedrun.com/api/v1/categories/${item.run.category}`);
    categoryData = JSON.parse(categoryData);
    const category = categoryData.data.name;

    const time = new Date(item.run.times.primary_t * 1000).toISOString().substr(11, 8);

    const video = item.run.videos != null ?
    item.run.videos.links[0].uri : 'Video not found.';

    formattedRuns.push({'username': username,
      'game': game, 'category': category, 'time': time, 'video': video});
  }

  return formattedRuns;
}

const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');

async function checkPBs() {
  // Input: None.
  // Output: Messages to specific channel which state PBs done in the past day.
  console.log(`Checking for PBs at ${new Date()}`);

  const newTimes = await postNewTimes();

  let sentence = 'Here are the runs verified within the last 24 hours:';

  const channel = DEBUG ? '614275762102468618' : '603335654415400961';
  client.channels.get(channel).send(sentence);

  // check if newTimes have been recorded in the past 24 hours
  // if they have them, push them to pb-brag
  if (newTimes.length > 0) {
    for (const item of newTimes) {
      sentence = `${item.game} - ${item.category} - ${item.username} - ${item.time} - ${item.video}`;
      client.channels.get(channel).send(sentence);
    }
  // otherwise, push no runs found.
  } else {
    sentence = 'No runs found.';
    client.channels.get(channel).send(sentence);
  }

  setTimeout(checkPBs, 86400000);
}

client.on('ready', () => {
  // Input: none
  // Output: Message which affirms connectivity.
  console.log(`Logged in as ${client.user.tag}!`);
  checkPBs();
});

client.on('message', (msg) => {
  // Input: message object
  // Output: dependent on query, does different things. See documentation
  // here: https://pastebin.com/ACpWB2YC

  if (msg.content.startsWith('!about')) {
    console.log(`Message received from ${msg.author} at ${msg.createdAt}`);
    console.log(`About message requested.`);
    msg.reply(`Hi! I'm a Discord bot used to improve QOL for the members of the Super Monkey Ball speedrunning Discord. My functions can be found here: https://pastebin.com/ACpWB2YC`);
  } else if (msg.content.startsWith('!randomStage')) {
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
        },
      };
      msg.channel.send({files: [pictureAttachment], embed: embed});
    }
  } else if (msg.content.startsWith('!getStage')) {
    console.log(`Message received from ${msg.author} at ${msg.createdAt}`);

    // Get stage from ID / name - 2 arguments needed
    let argList = msg.content.split(' ');
    argList = argList.slice(1, argList.length);

    // Checking if arguments are valid
    if (argList.length == 2 &&
      ['SMB1', 'SMB2'].includes(argList[0].toUpperCase())) {
      // checking if argument 2 is a name or an ID
      if (argList[1].match(/[ABEMabem]{1,2}\d{2}/) ||
      argList[1].match(/[Ss]\d{4}/)) {
        // feed arguments to function
        const item = getSMBLevelFromID(argList[0], argList[1]);

        // make the message using formatData,
        // then add attachment of image from the URL of the item.
        if (item == undefined) {
          msg.reply('No levels found in database with that ID.');
          console.log('No levels found in database with that ID.');
        } else {
          // make the message using formatData,
          // then add attachment of image from the URL of the item.
          msg.reply(formatData(item));
          console.log(item);

          const pictureAttachment = new Discord.Attachment(`./${item.picture}`);
          const embed = {
            image: {
              url: `attachment://${item.picture}`,
            },
          };
          msg.channel.send({files: [pictureAttachment], embed: embed});
        }
      } else {
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
        } else {
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
                },
              };
              msg.channel.send({files: [pictureAttachment], embed: embed});
            }
          }
        }
      }
    }
  }
});

client.login(auth.token);
