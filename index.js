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
    console.log(result.rows);
  }

  // close the connection
  client.end();
};

if (process.argv[2] === 'report') {
  const reportQuery = 'SELECT * FROM meals';
  client.query(reportQuery, whenQueryDone);
} else {
  console.error('Error: invalid command.');
  client.end();
}
