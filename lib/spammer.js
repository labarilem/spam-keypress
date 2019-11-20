const ora = require('ora');
const robot = require('robotjs');

const defaultOraConfig = {
  color: 'green',
  spinner: 'dots'
};

/**
 * Spams a sequence of keys.
 * @param {number} wait Time to wait before starting to spam. Expressed in milliseconds.
 * @param {string} keys Sequence of keys to press.
 * @param {number} times Number of times to repeat the keys sequence.
 * @param {number} interval Time interval that must pass between each sequence. Expressed in milliseconds.
 */
function spam(wait, keys, times, interval) {

  const spamPromise = new Promise(async (resolve, reject) => {

    try {
      const commands = parseKeys(keys);

      if (wait > 0) {
        await new Promise(r => setTimeout(r, wait));
      }

      if (times > 0) {
        for (let i = 0; i < times; i++) {
          for (const command of commands) {
            if (command.type === 'text') {
              robot.typeString(command.value);
            } else {
              robot.keyTap(command.value);
            }
          }

          if (interval > 0 && i + 1 < times) {
            await new Promise(r => setTimeout(r, interval));
          }
        }
      }
    } catch (err) {
      reject(err);
    }

    resolve();
  });

  ora.promise(spamPromise, Object.assign({ text: 'Spamming keys' }, defaultOraConfig));

  return spamPromise;

}

/**
 * Parses the specified sequence of keys.
 * @param {string} keys Sequence of keys.
 */
function parseKeys(keys) {
  const commands = [];

  if (!keys) {
    return commands;
  }

  let currentCharIndex = 0;
  let textSequence = '';
  while (currentCharIndex < keys.length) {
    const currentChar = keys.charAt(currentCharIndex);
    if (currentChar === '@') {
      // Found a tag

      // No closing tag found since we're at the end of the string
      if (currentCharIndex === keys.length - 1) {
        throw new Error(`Cannot parse keys: failed to find closing tag for the '@' at index ${currentCharIndex} in the sequence '${keys}'`);
      }

      const closingTagIndex = keys.indexOf('@', currentCharIndex + 1);

      // No closing tag found after the current tag
      if (closingTagIndex < 0) {
        throw new Error(`Cannot parse keys: failed to find closing tag for the '@' at index ${currentCharIndex} in the sequence '${keys}'`);
      }

      if (textSequence) {
        commands.push({ type: 'text', value: textSequence });
        textSequence = '';
      }

      commands.push({ type: 'key', value: keys.substring(currentCharIndex + 1, closingTagIndex) });

      currentCharIndex = closingTagIndex + 1;
    } else {
      // Found text
      textSequence += currentChar;
      currentCharIndex++;
    }
  }

  if (textSequence) {
    commands.push({ type: 'text', value: textSequence });
    textSequence = '';
  }

  return commands;
}


exports.spam = spam;
