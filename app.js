//. app.js
var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    ejs = require( 'ejs' ),
    { Configuration, OpenAIApi } = require( 'openai' ),
    app = express();

require( 'dotenv' ).config();

//. env values
var settings_apikey = 'API_KEY' in process.env ? process.env.API_KEY : ''; 
var settings_organization = 'ORGANIZATION' in process.env ? process.env.ORGANIZATION : ''; 
var settings_port = 'PORT' in process.env ? process.env.PORT : 8080; 
var settings_cors = 'CORS' in process.env ? process.env.CORS : ''; 

app.use( express.static( __dirname + '/public' ) );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'ejs' );

app.all( '/*', function( req, res, next ){
  if( settings_cors ){
    var origin = req.headers.origin;
    if( origin ){
      var cors = settings_cors.split( " " ).join( "" ).split( "," );

      //. cors = [ "*" ] への対応が必要
      if( cors.indexOf( '*' ) > -1 ){
        res.setHeader( 'Access-Control-Allow-Origin', '*' );
        res.setHeader( 'Vary', 'Origin' );
      }else{
        if( cors.indexOf( origin ) > -1 ){
          res.setHeader( 'Access-Control-Allow-Origin', origin );
          res.setHeader( 'Vary', 'Origin' );
        }
      }
    }
  }
  next();
});

app.get( '/', function( req, res ){
  res.render( 'index', {} );
});

var configuration = new Configuration({ apiKey: settings_apikey, organization: settings_organization });
var openai = new OpenAIApi( configuration );
app.post( '/api/image', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var n = ( req.body.n ? parseInt( req.body.n ) : 1 );
  var size = ( req.body.size ? req.body.size : '256x256' );
  var format = ( req.body.format ? req.body.format : 'url' /* 'url' or 'b64_json' */ );  //. response_format
  var prompt = req.body.prompt;

  var option = {
    prompt: prompt,
    n: n,
    size: size,
    response_format: format
  };

  var result = await openai.createImage( option );
  //console.log( result.data );
  //result.data.data[i].b64_json = "iVBORw0...";
  //. "data:image/png;base64," を付けると <img src="xx" に使える

  res.write( JSON.stringify( { status: true, result: result['data']['data'] }, null, 2 ) );
  res.end();
});

app.listen( settings_port );
console.log( "server starting on " + settings_port + " ..." );
