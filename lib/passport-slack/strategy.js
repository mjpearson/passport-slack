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
 *   - `clientID`               your Slack application's client id
 *   - `clientSecret`           your Slack application's client secret
 *   - `callbackURL`            URL to which Slack will redirect the user after granting authorization
 *   - `scope`                  array of permission scopes to request, for example:
 *                              'identify', 'channels:read', 'chat:write:user', 'client', or 'admin'
 *                              full set of scopes: https://api.slack.com/docs/oauth-scopes
 *   - `extendedUserProfile`    if set to false, only basic profile is fetched (does not require users:read scope)
 *                              if set to true (default) complete profile is loaded
 *
 * Examples:
 *
 *     passport.use(new SlackStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/slack/callback',
 *         scope: 'identify channels:read chat:write:user client admin'
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
  options.scopeSeparator = options.scopeSeparator || ' ';
  this.profileUrl = options.profileUrl || "https://slack.com/api/auth.test?token="; 
  this.userInfoUrl = options.userInfoUrl || "https://slack.com/api/users.info?user="; // requires 'users:read' scope
  this.extendedUserProfile = (options.extendedUserProfile == null) ? true : options.extendedUserProfile;
  this._team = options.team;

  OAuth2Strategy.call(this, options, verify);
  this.name = options.name || 'slack';

  // warn is not enough scope
  if(!this._skipUserProfile && this.extendedUserProfile && this._scope.indexOf('users:read') === -1){
    console.warn("Scope 'users:read' is required to retrieve Slack user profile");
  }
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
  var self = this;
  this.get(this.profileUrl, accessToken, function (err, body, res) {
    if (err) {
      return done(err);
    } else {
      try {
        var json = JSON.parse(body);

        if (!json.ok) {
          done(json);
        } else {
          var profile = {
            provider: 'Slack'
          };
          profile.id = json.user_id;
          profile.displayName = json.user;

          profile._raw = body;
          profile._json = json;

          // if extended user profile is not required, return what we already have
          if(!self.extendedUserProfile) {
            return done(null, profile);
          }
          // otherwise call for more detailed profile (requires users:read scope)
          self.get(self.userInfoUrl + profile.id + "&token=", accessToken, function (err, body, res) {
            if (err) {
              return done(err);
            }
            var infoJson = JSON.parse(body);
            if (!infoJson.ok) {
              done(infoJson);
            }else{
              profile._json.info = infoJson;
              done(null, profile);
            }
          });
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
