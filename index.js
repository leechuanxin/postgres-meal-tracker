import pg from 'pg';

const { Client } = pg;

// GLOBAL CONSTANTS
const COLUMNS = ['type', 'description', 'amount_of_alcohol', 'was_hungry_before_eating'];

// set the way we will connect to the server
const pgConnectionConfigs = {
  user: 'chuanxin',
  host: 'localhost',
  database: 'chuanxin',
  port: 5432, // Postgres server always runs on this port
};

// create the var we'll use
const client = new Client(pgConnectionConfigs);

// make the connection to the server
client.connect();

// create the query done callback
const whenQueryDone = (error, result) => {
  // this error is anything that goes wrong with the query
  if (error) {
    console.log('error', error);
  } else {
    // rows key has the data
    result.rows.forEach((col) => {
      const amtAlcoholFmt = (col.amount_of_alcohol <= 0) ? 'no alcohol' : `${col.amount_of_alcohol} unit(s) of alcohol`;
      const hungerFmt = (col.was_hungry_before_eating) ? 'feeling hungry' : 'not feeling hungry';
      console.log(`${col.id} ${col.type} -  ${col.description} - ${amtAlcoholFmt} - ${hungerFmt}`);
      // 1 breakfast - nasi lemak - no alcohol - feeling hungry
    });
  }

  // close the connection
  client.end();
};

const isInvalidAlcoholUnit = (unit) => (Number.isNaN(Number(unit)))
 || (!Number.isInteger(Number(unit))) || (Number(unit) < 0);

const isInvalidHungerValue = (unit) => unit.toLowerCase() !== 'true' && unit.toLowerCase() !== 'false';

if (process.argv[2] === 'report') {
  const reportQuery = 'SELECT * FROM meals';
  client.query(reportQuery, whenQueryDone);
} else if (process.argv[2] === 'log') {
  if (process.argv.length !== 7) {
    console.error('Error: Your command has to be in the following format:');
    console.error(
      'node index.js log <TYPE> <DESCRIPTION> <AMOUNT_OF_ALCOHOL> <WAS_HUNGRY_BEFORE_EATING>',
    );
    client.end();
  } else if (isInvalidAlcoholUnit(process.argv[5])) {
    console.error('Error: The unit amount of alcohol consumed with your meal should be an integer of 0 or larger.');
    console.error('Your command has to be in the following format:');
    console.error(
      'node index.js log <TYPE> <DESCRIPTION> <AMOUNT_OF_ALCOHOL> <WAS_HUNGRY_BEFORE_EATING>',
    );
    client.end();
  } else if (isInvalidHungerValue(process.argv[6])) {
    console.error('Error: The fact that you are hungry before your meal can only be set to true or false.');
    console.error('Your command has to be in the following format:');
    console.error(
      'node index.js log <TYPE> <DESCRIPTION> <AMOUNT_OF_ALCOHOL> <WAS_HUNGRY_BEFORE_EATING>',
    );
    client.end();
  } else {
    const input = [
      ...process.argv.slice(3, 5),
      Number(process.argv[5]),
      (process.argv[6].toLowerCase() === 'true'),
    ];
    const logQuery = 'INSERT INTO meals (type, description, amount_of_alcohol, was_hungry_before_eating) VALUES ($1, $2, $3, $4)';
    client.query(logQuery, input, whenQueryDone);
  }
} else if (process.argv[2] === 'edit') {
  if (process.argv.length !== 6) {
    console.error('Error: Your command has to be in the following format:');
    console.error('node index.js edit <MEAL_ID> <COLUMN_NAME> <COLUMN_VALUE>');
    client.end();
  } else if (Number.isNaN(Number(process.argv[3])) || Number(process.argv[3]) < 1) {
    console.error('Error: Please enter a valid MEAL_ID (1 or greater) to edit.');
    console.error('The sample edit command is: node index.js edit <MEAL_ID> <COLUMN_NAME> <COLUMN_VALUE>');
    client.end();
  } else if (COLUMNS.indexOf(process.argv[4]) < 0) {
    console.error('Error: Please enter a valid COLUMN_NAME to edit.');
    console.error(`Valid COLUMN_NAMEs: ${COLUMNS.join(', ')}`);
    console.error('The sample edit command is: node index.js edit <MEAL_ID> <COLUMN_NAME> <COLUMN_VALUE>');
    client.end();
  } else if (process.argv[4] === 'amount_of_alcohol' && isInvalidAlcoholUnit(process.argv[5])) {
    console.error('Error: The unit amount of alcohol consumed with your meal should be an integer of 0 or larger.');
    console.error('The sample edit command is: node index.js edit <MEAL_ID> <COLUMN_NAME> <COLUMN_VALUE>');
    client.end();
  } else if (process.argv[4] === 'was_hungry_before_eating' && isInvalidHungerValue(process.argv[5])) {
    console.error('Error: The fact that you are hungry before your meal can only be set to true or false.');
    console.error('The sample edit command is: node index.js edit <MEAL_ID> <COLUMN_NAME> <COLUMN_VALUE>');
    client.end();
  } else {
    const colEdited = process.argv[4];
    let editedValue = process.argv[5];
    if (colEdited === 'amount_of_alcohol') {
      editedValue = Number(editedValue);
    } else if (colEdited === 'was_hungry_before_eating') {
      editedValue = (process.argv[5].toLowerCase() === 'true');
    } else {
      editedValue = `'${editedValue}'`;
    }

    const editQuery = `UPDATE meals SET ${process.argv[4]} = ${editedValue} WHERE id=${process.argv[3]}`;
    client.query(editQuery, whenQueryDone);
  }
} else {
  console.error('Error: invalid command.');
  client.end();
}
