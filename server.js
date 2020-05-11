const request = require('request');
const queryString = require('query-string');
const express = require('express');
const app = express();
const env = require('dotenv').config()
app.use(express.static('public'));
var http = require('http').createServer(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose');
const spotifyApi = require('spotify-web-api-node');


mongoose.connect( "mongodb+srv://eigenShmector:Zlmonkey2@cluster0-kgaoe.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true })
.then(() => {
    console.log('server is connected')
}).catch(err =>{
  console.log(err)
})
app.get("/", (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/login', (req, res) => {
  const scope = 'user-read-playback-state user-modify-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' + 
    queryString.stringify({
      response_type: 'code',
      client_id:process.env.CLIENT_ID ,
      scope: scope,
      redirect_uri: process.env.REDIRECT_URI
    }));
});

app.get('/login_callback', (req, res) => {
  const {code} = req.query;
  const postOptions = { 
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': `Basic ${(new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'))}`
    },
    json: true
  };
    
  request.post(
    postOptions,
    (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const { access_token, refresh_token } = body;

        const getUserOptions = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': `Bearer ${access_token}` },
          json: true
        };

        request.get(getUserOptions, (error, response, body) => {
          const { id } = body;
          
          res.redirect('/?' +
            queryString.stringify({
              access_token: access_token,
              refresh_token: refresh_token,
              user_id: id
            }));
        });
      }
    }
  );
});

app.post('/queue', function(req,res) {
  const {uri, access_token} = req.query
  console.log(uri)
  const queue = {
    url: `https://api.spotify.com/v1/me/player/queue?uri=${uri}`,
    headers:{
      'Authorization': `Bearer ${access_token}`
    }
  }
  request.post(queue, (error,response)=>{
    console.log(response.statusCode)
  })

})

app.get('/refresh_token', function(req, res) {
  const { refresh_token } = req.query;
  
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 
      'Authorization': `Basic ${(new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'))}` 
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const { access_token } = body;
      res.send({
        'access_token': access_token
      });
    }
  });
});




app.get('/search', (req, res)=>{
    const {q,type,access_token} = req.query
    console.log(q)
    console.log("functioning")
    const getSearchOptions = {
      url: `https://api.spotify.com/v1/search?q=${q}&type=track`,
      headers: { 'Authorization': `Bearer ${access_token}` },
      json: true
    }

    request.get(getSearchOptions, (error, response, body) =>{

      res.send(body)
    });
});

app.get('/device',(req, res) =>{
  const{access_token, user_id} = req.query
  const getId ={
    url:`https://api.spotify.com/v1/me/player/devices`,
    headers: {'Authorization' : `Bearer ${access_token}`},
    json: true
  }
  request.get(getId, (error, response, body) =>{
    
      res.send(body)
  
  })
})


app.get('/tracks', (req, res) => {
  const { access_token, user_id, playlist_id} = req.query;
  
  const getPlaylistOptions = {
    url: `https://api.spotify.com/v1/users/${user_id}/playlists/${playlist_id}/tracks`,
    headers: { 'Authorization': `Bearer ${access_token}` },
    json: true
  }
  
  request.get(getPlaylistOptions, (error, response, body) => {
    res.send(body)
  });
});

var listener = app.listen('8080', function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
