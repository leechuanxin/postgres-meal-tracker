import pg from 'pg';

const { Client } = pg;

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
  } else if (Number.isNaN(Number(process.argv[5])) || !Number.isInteger(Number(process.argv[5]))) {
    console.error('Error: The unit amount of alcohol consumed with your meal should be an integer.');
    console.error('Your command has to be in the following format:');
    console.error(
      'node index.js log <TYPE> <DESCRIPTION> <AMOUNT_OF_ALCOHOL> <WAS_HUNGRY_BEFORE_EATING>',
    );
    client.end();
  } else if (process.argv[6].toLowerCase() !== 'true' && process.argv[6].toLowerCase() !== 'false') {
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
} else {
  console.error('Error: invalid command.');
  client.end();
}
