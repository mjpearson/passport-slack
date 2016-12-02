# passport-slack

[Passport](https://github.com/jaredhanson/passport) strategy for authenticating
with [Slack](https://slack.com) using the OAuth 2.0 API.

Updated to support Sign in with Slack by default.<br>
[![Sign in with Slack](https://a.slack-edge.com/accd8/img/sign_in_with_slack.png)](https://api.slack.com/docs/sign-in-with-slack#identify_users_and_their_teams)

## Notice

This repository is not getting the love it deserves. If you're interested in taking over maintenance or ownership of this repo and npm, please reach me (Mike Pearson) at github@x0rz.com

## Install
```shell
$ npm install passport-slack
```

## Express Example
```js
const {CLIENT_ID, CLIENT_SECRET, PORT} = process.env,
      SlackStrategy = require('passport-slack').Strategy,
      passport = require('passport'),
      express = require('express'),
      app = express();

// setup the strategy using defaults 
passport.use(new SlackStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET
  }, (accessToken, refreshToken, profile, done) => {
    // optionally persist profile data
    done(null, profile);
  }
));

app.use(passport.initialize());
app.use(require('body-parser').urlencoded({ extended: true }));

// path to start the OAuth flow
app.get('/auth/slack', passport.authorize('slack'));

// OAuth callback url
app.get('/auth/slack/callback', 
  passport.authorize('slack', { failureRedirect: '/login' }),
  (req, res) => res.redirect('/')
);

app.listen(PORT);
```

## Sample Profile
```json
{
    "provider": "Slack",
    "id": "U123XXXXX",
    "displayName": "John Agan",
    "user": {
        "name": "John Agan",
        "id": "U123XXXXX",
        "email": "johnagan@testing.com",
        "image_24": "https://secure.gravatar.com/avatar/123abcd123bc12b3c.jpg?s=24&d=https%3A%2F%2Fa.slack-edge.com%2F66f9%2Fimg%2Favatars%2Fava_0000-24.png",
        "image_32": "https://secure.gravatar.com/avatar/123abcd123bc12b3c.jpg?s=32&d=https%3A%2F%2Fa.slack-edge.com%2F66f9%2Fimg%2Favatars%2Fava_0000-32.png",
        "image_48": "https://secure.gravatar.com/avatar/123abcd123bc12b3c.jpg?s=48&d=https%3A%2F%2Fa.slack-edge.com%2F66f9%2Fimg%2Favatars%2Fava_0000-48.png",
        "image_72": "https://secure.gravatar.com/avatar/123abcd123bc12b3c.jpg?s=72&d=https%3A%2F%2Fa.slack-edge.com%2F66f9%2Fimg%2Favatars%2Fava_0000-72.png",
        "image_192": "https://secure.gravatar.com/avatar/123abcd123bc12b3c.jpg?s=192&d=https%3A%2F%2Fa.slack-edge.com%2F7fa9%2Fimg%2Favatars%2Fava_0000-192.png",
        "image_512": "https://secure.gravatar.com/avatar/123abcd123bc12b3c.jpg?s=512&d=https%3A%2F%2Fa.slack-edge.com%2F7fa9%2Fimg%2Favatars%2Fava_0000-512.png"
    },
    "team": {
        "id": "T123XXXX",
        "name": "My Awesome Team",
        "domain": "my-awesome-team",
        "image_34": "https://a.slack-edge.com/0000/img/avatars-teams/ava_0000-00.png",
        "image_44": "https://a.slack-edge.com/00a0/img/avatars-teams/ava_0000-00.png",
        "image_68": "https://a.slack-edge.com/00a0/img/avatars-teams/ava_0000-00.png",
        "image_88": "https://a.slack-edge.com/00a0/img/avatars-teams/ava_0000-00.png",
        "image_102": "https://a.slack-edge.com/00a0/img/avatars-teams/ava_0000-000.png",
        "image_132": "https://a.slack-edge.com/00a0/img/avatars-teams/ava_0000-000.png",
        "image_230": "https://a.slack-edge.com/0a0a0/img/avatars-teams/ava_0000-000.png",
        "image_default": true
    }
}

```

## Usage

### Configure Strategy

The Slack authentication strategy authenticates users using a Slack
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a client ID, client secret, and callback URL.

```js
passport.use(new SlackStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    skipUserProfile: false, // default
    scope: ['identity.basic', 'identity.email', 'identity.avatar', 'identity.team'] // default
  },
  (accessToken, refreshToken, profile, done) => {
    // optionally persist user data into a database
    done(null, profile);
  }
));
```

### Authenticate Requests

Use `passport.authorize()` (or `passport.authenticate()` if you want to authenticate with Slack and affect `req.user` and user session), specifying the `'slack'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js
app.get('/auth/slack', passport.authorize('slack'));

app.get('/auth/slack/callback',
  passport.authorize('slack', { failureRedirect: '/login' }),
  (req, res) => res.redirect('/') // Successful authentication, redirect home.
);
```

### Custom Scopes
By default passport-slack strategy will try to retrieve [all user identity](https://api.slack.com/methods/users.identity) from Slack using the default scopes of `identity.basic`, `identity.email`, `identity.avatar`, and `identity.team`. To override these, set the `scope` parameter to an array of scopes.

```js
passport.use(new SlackStrategy({
	clientID: CLIENT_ID,
	clientSecret: CLIENT_SECRET,
	scope: ['identity.basic', 'channels:read', 'chat:write:user']
}, () => { });
```

### Ignore Profile Info
If you just need an access token and not user profile data, you can avoid getting profile info by setting `skipUserProfile` to true.
```js
passport.use(new SlackStrategy({
	clientID: CLIENT_ID,
	clientSecret: CLIENT_SECRET,
	scope: ['incoming-webhook'],
	skipUserProfile: true
}, () => { });
```

## Thanks

  - [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2014 [Michael Pearson](http://github.com/mjpearson)
