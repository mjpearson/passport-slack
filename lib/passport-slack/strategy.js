/**
 * Module dependencies.
 */
var util = require('util')
, OAuth2Strategy = require('passport-oauth').OAuth2Strategy;


/**
 * `Strategy` constructor.
 *
 * The Slack authentication strategy authenticates requests by delegating
 * to Slack using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Slack application's client id
 *   - `clientSecret`  your Slack application's client secret
 *   - `callbackURL`   URL to which Slack will redirect the user after granting authorization
 *   - `scope`         array of permission scopes to request.  valid scopes include:
 *                     'identify', 'read', 'post', 'client', or 'admin'.
 *
 * Examples:
 *
 *     passport.use(new SlackStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/slack/callback',
 *         scope: 'identify,read,post,client,admin'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://slack.com/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://slack.com/api/oauth.access';
  options.scopeSeparator = options.scopeSeparator || ',';
  this.profileUrl = options.profileUrl || "https://slack.com/api/auth.test?token=";
  this._team = options.team;

  OAuth2Strategy.call(this, options, verify);
  this.name = 'slack';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from Slack.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `slack`
 *   - `id`               the user's ID
 *   - `displayName`      the user's username
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  //this._oauth2.useAuthorizationHeaderforGET(true);
  this.get(this.profileUrl, accessToken, function (err, body, res) {
    if (err) {
      return done(err);
    } else {
      try {
        var json = JSON.parse(body);

        if (!json.ok) {
          done(json.error ? json.error : body);
        } else {
          var profile = {
            provider: 'Slack'
          };
          profile.id = json.user_id;
          profile.displayName = json.user;

          profile._raw = body;
          profile._json = json;

          done(null, profile);
        }
      } catch(e) {
        done(e);
      }
    }
  });
}

/** The default oauth2 strategy puts the access_token into Authorization: header AND query string
  * which is a violation of the RFC so lets override and not add the header and supply only the token for qs.
  */
Strategy.prototype.get = function(url, access_token, callback) {
  this._oauth2._request("GET", url + access_token, {}, "", "", callback );
};



/**
 * Return extra Slack parameters to be included in the authorization
 * request.
 *
 * @param {Object} options
 * @return {Object}
 */
Strategy.prototype.authorizationParams = function (options) {
  var params = {};
  var team = options.team || this._team;
   if(team){
     params.team = team;
   }
  return params;
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
