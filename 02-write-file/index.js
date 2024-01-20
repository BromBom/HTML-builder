const fs = require('fs');
const path = require('path');
const Emitter = require('events');
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');


const address = path.join(__dirname, 'text.txt');
const rl = readline.createInterface({ input, output });

output.write('Hello!\n');
output.write('Input your massage: \n');

let emitter = new Emitter();

emitter.on('done', () => {
  rl.question('', (answer) => {
    if (answer !== 'exit') {
      fs.appendFile(
        address,
        answer + '\n',
        (err) => {
          if (err) throw err;
          console.log('Done!');
        }
      );
      emitter.emit('done');
    } else {
      rl.close();
    }
  });
});

emitter.emit('done');
rl.on('close', () => console.log('The file has been modified!'));