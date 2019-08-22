const request = require('request-promise');
// const requestDebug = require("request-debug");

// if (process.env.NODE_ENV !== "production") {
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

(async function () {
    console.log(await requestSMBLeaderboards());

    // once gotten, get user names by doing a user query for each new PB

    // get username from run.players.id
    // put that into following get query: https://www.speedrun.com/api/v1/users/ + id and get the names list (maybe international name?)

    // when done, get the time from the run (under times (primary_t) and convert it to minutes/seconds (since it's number of seconds)
})();