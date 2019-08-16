/*jshint esversion: 6 */

const fs = require('fs');

////////////////////////////////////////////////////////////////////////////////
// SMB2 INFO
////////////////////////////////////////////////////////////////////////////////

difficultySMB2 = ['beginner', 'beginnerExtra', 'advanced', 'advancedExtra', 'expert', 'expertExtra', 'master', 'masterExtra', 'story'];

// lists of numbers from 1 to n inclusive, where n is number of levels
levelSMB2 = {
  'beginner': Array.from({length: 10}, (_, i) => i + 1),
  'beginnerExtra': Array.from({length: 10}, (_, i) => i + 1),
  'advanced': Array.from({length: 30}, (_, i) => i + 1),
  'advancedExtra': Array.from({length: 10}, (_, i) => i + 1),
  'expert': Array.from({length: 50}, (_, i) => i + 1),
  'expertExtra': Array.from({length: 10}, (_, i) => i + 1),
  'master': Array.from({length: 10}, (_, i) => i + 1),
  'masterExtra': Array.from({length: 10}, (_, i) => i + 1),
  'story': Array.from({length: 100}, (_, i) => i + 1),
};

namesSMB2 = {
  'beginner': ['Simple','Hollow','Bumpy','Switches','Bowl (Rising Inclines)','Floaters','Slopes (Tub)','Sliders (Windy Slide)','Spinning Top','Curve Bridge'],

  'beginnerExtra': ['Conveyers','Bumpy Check','Alternative','Junction','Bead Screen','Fluctuation','Folders','Quick Turn','Linear Seesaws','Birth'],

  'advanced': ['Banks','Eaten Floor','Hoppers','Coaster','Board Park','Swell','Gravity Slider','Inchworms','Totalitarianism','Leveler','Organic Form','Reversible Gear','Stepping Stones','Dribbles','U.R.L.','Mad Rings','Curvy Options','Twister (Twist & Spin)','Downhill (Cascade)','Rampage','Pro Skaters','Giant Comb','Beehive','Dynamic Maze','Triangle Holes','Launchers','Randomizer','Coin Slots','Seesaw Bridges','Arthropod'],

  'advancedExtra': ['Auto Doors','Heavy Sphere','Stagger','U.F.O.','Ring Bridges','Domes','Amida Lot','Long Slider','Grid Bridge','Teapot'],

  'expert': ['Wormhole','Free Fall','Melting Pot','Mad Shuffle','Partition','Jump Machine','Zigzag Slope','Tower','Toggle','Pachinko','Combination','Punched Seesaws','Opera','Brandished','Tiers','Cliffs','Narrow Peaks','Detour','Switch Inferno','Earthquake','Spiral Bridge','Wavy Option','Obstacle','Domino','Sieve','Flock','Double Spiral','Hierarchy','8 Bracelets','Banana Hunting','Pistons','Soft Cream','Momentum','Entangled Path','Totters','Vortex','Warp','Trampolines','Swing Shaft','Fighters','Serial Jump','Cross Floors','Spinning Saw','Chipped Pipes','Flat Maze','Guillotine','Cork Screw','Orbiters','Twin Basin','Air Hockey'],
  'expertExtra': ['Charge','Strata','Puzzle (Square Dance)','Giant Swing','5 Drums','Free Throw','Pendulums','Conical Slider','Construction','Train Worm'],

  'master': ['Centrifugal','Swing Bridges','Cylinders','Passage','Notch','Intermittent','Long Torus','Spasmodic','Double Twin','Clock Face'],

  'masterExtra': ['Variable Width','Striker','Ooparts','Planets','Sliced Cheese','8 Seesaws','Synchronized','Helix','Dizzy System','Nintendo'],

  'story': ['Simple','Hollow','Bumpy','Switches','Conveyers','Floaters','Slopes (Tub)','Sliders (Windy Slide)','Spinning Top','Curve Bridge','Banks','Eaten Floor','Hoppers','Coaster','Bumpy Check','Swell','Gravity Slider','Inchworms','Totalitarianism','Alternative','Organic Form','Reversible Gear','Stepping Stones','Dribbles','U.R.L.','Mad Rings','Curvy Options','Twister','Downhill','Junction','Pro Skaters','Giant Comb','Beehive','Dynamic Maze','Triangle Holes','Launchers','Randomizer','Coin Slots','Seesaw Bridges','Arthropod','Wormhole','Free Fall','Melting Pot','Mad Shuffle','Bead Screen','Jump Machine','Zigzag Slope','Tower','Toggle','Fluctuation','Combination','Punched Seesaws','Opera','Brandished','Tiers','Cliffs','Narrow Peaks','Detour','Switch Inferno','Folders','Spiral Bridge','Wavy Option','Obstacle','Domino','Sieve','Flock','Double Spiral','Hierarchy','8 Bracelets','Quick Turn','Pistons','Soft Cream','Momentum','Entangled Path','Totters','Vortex','Warp','Trampolines','Swing Shaft','Linear Seesaws','Serial Jump','Cross Floors','Spinning Saw','Chipped Pipes','Flat Maze','Guillotine','Cork Screw','Orbiters','Twin Basin','Air Hockey','Training','Gimmick','Mountain','Disorder','3D Maze','Labyrinth (Crazy Maze)','Postmodern','Revolution','Invisible','Created By']
};

////////////////////////////////////////////////////////////////////////////////
// SMB1 INFO
////////////////////////////////////////////////////////////////////////////////

difficultySMB1 = ['beginner', 'beginnerExtra', 'advanced', 'advancedExtra', 'expert', 'expertExtra', 'master'];

// lists of numbers from 1 to n inclusive, where n is number of levels
levelSMB1 = {
  'beginner': Array.from({length: 10}, (_, i) => i + 1),
  'beginnerExtra': Array.from({length: 3}, (_, i) => i + 1),
  'advanced': Array.from({length: 30}, (_, i) => i + 1),
  'advancedExtra': Array.from({length: 5}, (_, i) => i + 1),
  'expert': Array.from({length: 50}, (_, i) => i + 1),
  'expertExtra': Array.from({length: 10}, (_, i) => i + 1),
  'master': Array.from({length: 10}, (_, i) => i + 1),
};

namesSMB1 = {
  'beginner': ['Plain','Diamond','Hairpin','Wide Bridge','Bonus Basic','Slopes','Steps','Blocks','Jump Single','Exam-A'],

  'beginnerExtra': ['Blur Bridge','Hitter','AV Logo'],
  
  'advanced': ['Bump','Walking','Repulse','Narrow Bridge','Bonus Basic','Break','Curves','Downhill','Blocks Slim','Bonus Wave','Choice','Bowl','Jumpies','Stoppers','Floor Bent','Conveyor','Exam-B','Chaser','Jump Double','Bonus Grid','Middle Jam','Ant Lion','Collapse','Swing Bar','Labyrinth','Spiral','Wavy Jump','Spiky','Unrest','Polar'],
  
  'advancedExtra': ['Blur Bridge','Hard Hitter','Puzzle','AV Logo','Polar Large'],
  
  'expert': ['Ruin','Branch','Overturn','Excursion','Bonus Basic','Dodecagon','Exam-C','Skeleton','Tracks','Bonus Wave','Downhill Hard','Gears','Destruction','Invasion','Diving','Floor Slant','Tram','Swing Bar Long','Paper Work','Bonus Grid','Twin Attacker','Sega Logo','Snake','Wind','Windy Slide','Fall Down','Twin Cross','Spiral Hard','Conveyor Parts','Bonus Bumpy','Gaps','Curvature','Ant Lion Super','Drum','Twister','Speedy Jam','Quake','Cassiopeia','Pirates','Bonus Hunting','Bowl Open','Checker','Carpet','Ridge','Mixer','Rings','Stairs','Clover','Coffee Cup','Metamorphosis'],
  
  'expertExtra': ['Blur Bridge','Breathe','Hard Hitter','Ferris Wheel','Factory','Curl Pipe','Magic Hand','AV Logo','Sanctuary','Daa Loo Maa'],
  
  'master': ['Wave Master','Fan Master','Stamina Master','Spring Master','Dance Master','Roll Master','Edge Master','Dodge Master','Bridge Master','Monkey Master'],
};

// object definition for JSON
class SMBStage {
  constructor(game, difficulty, level, name) {
    // Input: game:string, difficulty:string, world:number, level:number, name:string, picture:string.
    // Expected args:
      // game: either smb1 or smb2 or smbdx
      // difficulty: Beginner, Beginner Extra, Advanced, Advanced Extra, Expert, Expert Extra, Master, Master Extra, Story
      // world: number 1-10
      // level: number
      // name: string
      // picture: url (from given directory)
    // Output: new SMBStage object.
    
    this.game = game;
    this.difficulty = difficulty;
    // story mode does worlds / levels different
    if (this.difficulty == "story") {
      this.world = Math.ceil(level / 10);
      this.level = (level % 10 == 0) ? 10 : level % 10;
    }
    else {
      this.world = undefined;
      this.level = level;
    }
    this.name = name;
    this.picture = `${game}/${difficulty}/${level}.png`;
  }
}

function createStages(game, difficulty, level, names) {
  // Input: 
    // game : string
    // difficulty : array of strings
    // level : object of difficulty => array of numbers
    // names : object of difficulty => array of strings 
  // Output: Array of SMBStage objects corresponding to all SMB1 levels.

  var stages = [];
  // for each difficulty
  for (var j = 0; j < difficulty.length; j++) {
    // for each level in the specific difficulty
    level[difficulty[j]].forEach(function(item) { 
      // making a SMBStage object with the following parameters:
        // game
        // difficulty
        // level
        // name
      stages.push(new SMBStage(game, 
                               difficulty[j], 
                               item, 
                               names[difficulty[j]][item - 1]));
      }
    );
  }
  return stages;
}

smb1 = createStages("smb1", difficultySMB1, levelSMB1, namesSMB1);
smb2 = createStages("smb2", difficultySMB2, levelSMB2, namesSMB2);
all = smb1.concat(smb2);

data = JSON.stringify(all);
fs.writeFileSync('smb-data.json', data);