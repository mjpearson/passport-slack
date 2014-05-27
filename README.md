# passport-slack

[Passport](https://github.com/jaredhanson/passport) strategy for authenticating
with [Slack](https://slack.com) using the OAuth 2.0 API.

## Install

    $ npm install passport-slack

## Usage

#### Configure Strategy

The Slack authentication strategy authenticates users using a Slack
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a client ID, client secret, and callback URL.

    passport.use(new SlackStrategy({
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ SlackId: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authorize()`, specifying the `'slack'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/slack',
      passport.authorize('slack'));

    app.get('/auth/slack/callback', 
      passport.authorize('slack', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Thanks

  - [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2014 [Michael Pearson](http://github.com/mjpearson)
