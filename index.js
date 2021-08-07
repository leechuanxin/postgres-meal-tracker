import express from 'express';

const app = express();
const PORT = process.argv[2];

// Set view engine
app.set('view engine', 'ejs');

app.get('/fruit', (request, response) => {
  // Obtain data to inject into EJS template
  const data = {
    fruit: {
      species: 'M. domestica',
      name: 'banana',
    },
  };
  // Return HTML to client, merging "index" template with supplied data.
  response.render('fruit', data);
});

app.listen(PORT);
