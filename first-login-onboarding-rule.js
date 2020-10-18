// See https://auth0.com/docs/rules/redirect-users for more info
function(user, context, callback) {
  const loginCount = context.stats && context.stats.loginsCount ? context.stats.loginsCount : 0;
  const url = require('url@0.10.3');

  const configuration = {
    CLIENT_ID: "YOUR_CLIENT_ID_HERE",
    CLIENT_SECRET: "YOUR_CLIENT_SECRET_HERE",
    ISSUER: "https://YOUR_AUTH0_DOMAIN_HERE/", // It should have the https:// protocol and the trailing slash /
    APP_URL: "https://YOUR_API_SERVICE_DOMAIN_HERE" // Without trailing slash
  };

  function createToken(clientId, clientSecret, issuer, user) {
    const options = {
      expiresInMinutes: 5,
      audience: clientId,
      issuer: issuer
    };
    return jwt.sign(user, clientSecret, options);
  }

  // If redirect callback, then continue...
  if (context.protocol === "redirect-callback") {
  	return callback(null, user, context);
  } else {
    // If it's the first time login, we send them to /onboarding
    if (loginCount === 1) {
      const token = createToken(
        configuration.CLIENT_ID,
        configuration.CLIENT_SECRET,
        configuration.ISSUER, {
          sub: user.user_id,
          email: user.email,
          authorize_again: url.format({
            protocol: 'https',
            hostname: auth0.domain,
            pathname: '/authorize',
            query: context.request.query
          })
        }
      );
      context.redirect = {
        url: `${configuration.APP_URL}/onboarding?token=${token}` // You can have a different /onboarding URL, just change this accordingly
      };
    }
  }


  return callback(null, user, context);
}
