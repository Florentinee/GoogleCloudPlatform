const express = require('express')
const app = express()
const port = 3000

//set view engine
app.set("view engine","jade")

var dataGooglePlaces = Array();
var dataEvents = Array();
var dataTasks = Array();
var dataTasks2 = Array();

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

function googleMapsPlaces(){
    const googleMapsClient = require('@google/maps').createClient({
      key: 'AIzaSyD3tMVfI2heB7zORWu4S8tHys3n9BR2n_g'
    });

    // Geocode an address.
    googleMapsClient.places({
      // query:'sfantul+lazar+street'
      query: 'iasi'
    }, function(err, response) {
      if (!err) {
        // console.log(response.json.results);
        dataGooglePlaces[0] = response.json.results[0];
      }
    });

    // Geocode an address.
    googleMapsClient.places({
      // query:'sfantul+lazar+street'
      query: 'bucuresti'
    }, function(err, response) {
      if (!err) {
        // console.log(response.json.results);
        dataGooglePlaces[1] = response.json.results[0];
      }
    });
} 

function calendarEvents(){
        // If modifying these scopes, delete token.json.
    const SCOPES = ['https://www.googleapis.com/auth/calendar'];
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    const TOKEN_PATH = 'token_temp.json';

    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Calendar API.
      authorize(JSON.parse(content), listEvents);
    });

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    function authorize(credentials, callback) {
      const {client_secret, client_id, redirect_uris} = credentials.installed;
      const oAuth2Client = new google.auth.OAuth2(
          client_id, client_secret, redirect_uris[0]);

      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
      });
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */

    function getAccessToken(oAuth2Client, callback) {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
      console.log('Authorize this app by visiting this url:', authUrl);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
          if (err) return console.error('Error retrieving access token', err);
          oAuth2Client.setCredentials(token);
          // Store the token to disk for later program executions
          fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) return console.error(err);
            console.log('Token stored to', TOKEN_PATH);
          });
          callback(oAuth2Client);
        });
      });
    }

    /**
     * Lists the next 10 events on the user's primary calendar.
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */


    function listEvents(auth) {
      const calendar = google.calendar({version: 'v3', auth});
      calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const events = res.data.items;
        if (events.length) {
          // console.log(events);
          events.map((event, i) => {
            dataEvents[i] = event;
          });
        } else {
          console.log('No upcoming events found.');
        }
      });
    }
}

function taskList(){


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/tasks.readonly','https://www.googleapis.com/auth/tasks'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Tasks API.
  authorize(JSON.parse(content), listTaskLists);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the user's first 10 task lists.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listTaskLists(auth) {
  const service = google.tasks({version: 'v1', auth});
  service.tasks.list({
    tasklist: 'MTI4OTAzMTY2ODMzNjY5ODYyMDc6MDow',
  }, (err, res) => {
    if (err) return console.error('The API returned an error: ' + err);
    const taskLists = res.data.items;
    if (taskLists) {
        taskLists.forEach((taskList) => {
            dataTasks.push(taskList.title)
        });
    } else {
      console.log('No task lists found.');
    }
  });
  service.tasks.list({
    tasklist: 'MTI4OTAzMTY2ODMzNjY5ODYyMDc6NjI2NDk4ODA1MjU3NTA3ODEyMTk6MA',
  }, (err, res) => {
    if (err) return console.error('The API returned an error: ' + err);
    const taskLists = res.data.items;
    if (taskLists) {
        taskLists.forEach((taskList) => {
            dataTasks2.push(taskList.title)
        });
    } else {
      console.log('No task lists found.');
    }
  });
}
}

  calendarEvents();
  googleMapsPlaces();
  taskList();  


app.get('/', function (req, res) {

  var photos = dataGooglePlaces[0].photos[0];
  //console.log(photos);
  var link = photos.html_attributions[0].split(/"/)[1];
  var link_img = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photos.photo_reference}&sensor=false&maxheight=400&maxwidth=600&key=AIzaSyD3tMVfI2heB7zORWu4S8tHys3n9BR2n_g`

  var ev_start = dataEvents[0].start.dateTime || dataEvents[0].start.date;
  var ev_id = dataEvents[0].id;
  res.render('event1.jade', {location_name: dataGooglePlaces[0].formatted_address, link: link, link_img: link_img,
                            ev_id:ev_id,ev_start:ev_start,ev_name:dataEvents[0].summary,
                            list_tasks : dataTasks , labelEv1:dataEvents[0].summary , labelEv2:dataEvents[1].summary
                            });
});

app.get('/event2', function (req, res) {

  var photos = dataGooglePlaces[1].photos[0];
  var link = photos.html_attributions[0].split(/"/)[1];
  var link_img = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photos.photo_reference}&sensor=false&maxheight=400&maxwidth=600&key=AIzaSyD3tMVfI2heB7zORWu4S8tHys3n9BR2n_g`

  var ev_start = dataEvents[1].start.dateTime || dataEvents[1].start.date;
  var ev_id = dataEvents[1].id;
  res.render('event2.jade', {location_name: dataGooglePlaces[1].formatted_address, link: link, link_img: link_img,
                            ev_id:ev_id,ev_start:ev_start,ev_name:dataEvents[1].summary,
                            list_tasks : dataTasks2, labelEv1:dataEvents[0].summary , labelEv2:dataEvents[1].summary
                            });
});

app.listen(port, () => console.log(`App listening on port ${port}!`));
