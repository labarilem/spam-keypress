const program = require('commander');
const spammer = require('./spammer');
const asciify = require('asciify');
const chalk = require('chalk');

asciify('spam-keypress', { color: 'red', font: 'straight' }, onReady);

function onReady(err, title) {
  console.log(title);

  program
    .version('1.0.0')
    .description('Spams OS keypress events.\nYou can specify special keys by enclosing the key name in \'@\' characters. Example:\n$ spam-keypress "abc@enter@"')
    .arguments('<keys>')
    .option('-w, --wait [ms]', 'Time to wait before starting to spam. Expressed in milliseconds.', 0)
    .option('-t, --times [times]', 'Repeats N times the keys sequence.', 1)
    .option('-i, --interval [ms]', 'Time interval that must pass between each sequence. Expressed in milliseconds.', 0)
    .action((keys, cmdObj) => {
      spammer.spam(program.wait, keys, program.times, program.interval)
        .then(() => {
          console.log(chalk.green('Done.'));
        })
        .catch((err) => {
          console.error('An error occurred:\n' + err.message);
        });
    })
    .parse(process.argv);
}
