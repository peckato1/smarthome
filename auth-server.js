require('dotenv').config();
const express = require('express');
const {
  OAuth2Client,
  	UserRefreshClient,
} = require('google-auth-library');
const cors = require('cors');

const CLIENT_ID = '1099244946939-st4v6rpftfaqlbc6t1pprih7r3ptifgm.apps.googleusercontent.com';
const CLIENT_SECRET = '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';

const app = express();

app.use(cors());
app.use(express.json());

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, 'postmessage');

app.post('/auth/google', async (req, res) => {
  const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens
  console.log(tokens);

  res.json(tokens);
});

app.post('/auth/google/refresh-token', async (req, res) => {
  const user = new UserRefreshClient(CLIENT_ID, CLIENT_SECRET, req.body.refreshToken);
  const { credentials } = await user.refreshAccessToken(); // obtain new tokens
  res.json(credentials);
})

app.listen(5000, () => console.log(`server is running`));
