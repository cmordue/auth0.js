describe('Auth0', function () {

  afterEach(function () {
    global.window.location.hash = "";
  });

  it('should fail to construct without a clientID', function () {
    expect(function () {
      new Auth0({});
    }).to.throwError('clientID is required');
  });

  it('should fail to construct without a callbackURL', function () {
    expect(function () {
      new Auth0({clientID: '1123sadsd'});
    }).to.throwError('callbackURL is required');
  });

  it('should fail to construct without a domain', function () {
    expect(function () {
      new Auth0({clientID: '1123sadsd', callbackURL: 'aaaa'});
    }).to.throwError('domain is required');
  });

  it('should force constructor', function () {
    var initialized_without_new = Auth0({
      clientID:    'aaaabcdefgh',
      callbackURL: 'https://myapp.com/callback',
      domain:      'aaa.auth0.com'
    });

    expect(initialized_without_new)
      .to.be.an(Auth0);
  });


  it('should redirect to /authorize with google (callbackOnLocationHash: on)', function (done) {
    var auth0 = Auth0({
      clientID:    'aaaabcdefgh',
      domain:      'aaa.auth0.com',
      callbackURL: 'https://myapp.com/callback',
      callbackOnLocationHash: true
    });

    auth0._redirect = function (the_url) {
      expect(the_url.split('?')[0])
        .to.contain('https://aaa.auth0.com/authorize');

      var parsed = {};
      the_url.split('?')[1].replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function($0, $1, $2, $3) { parsed[$1] = decodeURIComponent($3); }
      );

      expect(parsed.response_type).to.equal('token');
      expect(parsed.redirect_uri).to.equal('https://myapp.com/callback');
      expect(parsed.client_id).to.equal('aaaabcdefgh');
      expect(parsed.scope).to.equal('openid profile');
      done();
    };

    auth0.login({
      connection: 'google-oauth2'
    });
  });

  it('should support to use signin as an alias for login', function () {
    var auth0 = Auth0({
      clientID:    'aaaabcdefgh',
      domain:      'aaa.auth0.com',
      callbackURL: 'https://myapp.com/callback',
      callbackOnLocationHash: true
    });

    expect(auth0.signin).to.be.equal(auth0.login);
  });

  it('should redirect to /authorize with google (callbackOnLocationHash: off)', function (done) {
    var auth0 = Auth0({
      clientID:     'aaaabcdefgh',
      callbackURL: 'https://myapp.com/callback',
      domain:       'aaa.auth0.com'
    });

    auth0._redirect = function (the_url) {
      expect(the_url.split('?')[0])
        .to.contain('https://aaa.auth0.com/authorize');

      var parsed = {};
      the_url.split('?')[1].replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function($0, $1, $2, $3) { parsed[$1] = decodeURIComponent($3); }
      );

      expect(parsed.response_type).to.equal('code');
      expect(parsed.redirect_uri).to.equal('https://myapp.com/callback');
      expect(parsed.client_id).to.equal('aaaabcdefgh');
      expect(parsed.scope).to.equal('openid profile');
      done();
    };

    auth0.login({
      connection: 'google-oauth2'
    });
  });

  describe('parseHash', function () {

    it('should be able to parse the profile', function (done) {
      var hash = "#access_token=jFxsZUQTJXXwcwIm&id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2xvZ2luLmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDExODMwNDIzMTY0MDMwMTY4NTU3OSIsImF1ZCI6IjBIUDcxR1NkNlB1b1JZSjNEWEtkaVhDVVVkR21CYnVwIiwiZXhwIjoxMzgwMjU4NzU4LCJpYXQiOjEzODAyMjI3NTgsImNsaWVudElEIjoiMEhQNzFHU2Q2UHVvUllKM0RYS2RpWENVVWRHbUJidXAiLCJlbWFpbCI6Impvc2Uucm9tYW5pZWxsb0BxcmFmdGxhYnMuY29tIiwiZmFtaWx5X25hbWUiOiJSb21hbmllbGxvIiwiZ2VuZGVyIjoibWFsZSIsImdpdmVuX25hbWUiOiJKb3NlIiwiaWRlbnRpdGllcyI6W3siYWNjZXNzX3Rva2VuIjoieWEyOS5BSEVTNlpUSllmQnN3a1NFbUU2YTQ2SlpHYVgxV1Jqc2ZrUzd5Vm81RXNPdktKWVhnenpEZl9ZUiIsInByb3ZpZGVyIjoiZ29vZ2xlLW9hdXRoMiIsInVzZXJfaWQiOiIxMTgzMDQyMzE2NDAzMDE2ODU1NzkiLCJjb25uZWN0aW9uIjoiZ29vZ2xlLW9hdXRoMiIsImlzU29jaWFsIjp0cnVlfV0sImxvY2FsZSI6ImVuIiwibmFtZSI6Ikpvc2UgUm9tYW5pZWxsbyIsIm5pY2tuYW1lIjoiam9zZS5yb21hbmllbGxvIiwicGljdHVyZSI6Imh0dHBzOi8vbGg2Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tcF81dUwxTDFkdkUvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQlEvaVBIRUQ0ajlxblkvcGhvdG8uanBnIiwidXNlcl9pZCI6Imdvb2dsZS1vYXV0aDJ8MTE4MzA0MjMxNjQwMzAxNjg1NTc5In0.Qrhrkp7hCYFyN_Ax9yVPKztuJNFHjnGbyUfLJsccLGU&token_type=bearer&state=Ttct3tBlHDhRnXCv";

      var auth0 = Auth0({
        clientID:     'aaaabcdefgh',
        callbackURL:  'https://myapp.com/callback',
        domain:       'aaa.auth0.com'
      });

      auth0.parseHash(hash, function (profile, id_token, access_token, state) {
        expect(profile.name).to.eql('Jose Romaniello');
        expect(access_token).to.eql('jFxsZUQTJXXwcwIm');
        expect(state).to.eql('Ttct3tBlHDhRnXCv');
        done();
      });

    });

    it('should be able to parse an error', function (done) {
      var hash = '#error=invalid_grant&error_description=this%20is%20a%20cool%20error%20description';

      var auth0 = Auth0({
        clientID:     'aaaabcdefgh',
        callbackURL:  'https://myapp.com/callback',
        domain:       'aaa.auth0.com'
      });

      function neverCall() {
        // should never call success as it fails
        expect(false).to.be.equal(true);
      }

      auth0.parseHash(hash, neverCall, function (error) {
        expect(error.error).to.be.equal('invalid_grant');
        expect(error.error_description).to.be.equal('this is a cool error description');
        done();
      });

    });

  });

  it('should not call the callback if the hash doesnt contain access_token', function (done) {
    var hash = "#myfooobarrr=123";

    var auth0 = Auth0({
      clientID:     'aaaabcdefgh',
      callbackURL:  'https://myapp.com/callback',
      domain:       'aaa.auth0.com'
    });

    auth0.parseHash(hash, function () {
      done(new Error('this should not be called'));
    });

    done();
  });

  it('should return SSO data', function (done) {
    var auth0 = Auth0({
      clientID:     'aaaabcdefgh',
      callbackURL:  'https://myapp.com/callback',
      domain:       'aaa.auth0.com'
    });

    auth0.getSSOData(function (err, ssoData) {
      expect(ssoData.sso).to.exist;
      done();
    });
  });

  it('should return configured connections', function (done) {
    var auth0 = Auth0({
      domain:      'mdocs.auth0.com',
      callbackURL: 'http://localhost:3000/',
      clientID:    'ptR6URmXef0OfBDHK0aCIy7iPKpdCG4t'
    });

    auth0.getConnections(function (err, conns) {
      expect(conns.length).to.be.above(0);
      expect(conns[0].name).to.eql('Apprenda.com');
      expect(conns[0].strategy).to.eql('adfs');
      expect(conns[0].status).to.eql(false);
      expect(conns[0].domain).to.eql('Apprenda.com');
      done();
    });
  });

  describe('getDelegationToken', function () {
    var auth0 = Auth0({
      domain:      'mdocs.auth0.com',
      callbackURL: 'http://localhost:3000/',
      clientID:    'ptR6URmXef0OfBDHK0aCIy7iPKpdCG4t'
    });

    it('should returns delegation token', function (done) {
      var targetClientId = '0HP71GSd6PuoRYJ3DXKdiXCUUdGmBbup';
      var id_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL21kb2NzLmF1dGgwLmNvbTozMDAwLyIsInN1YiI6InRlc3QtdXNlci1pZCIsImF1ZCI6IjBIUDcxR1NkNlB1b1JZSjNEWEtkaVhDVVVkR21CYnVwIiwiZXhwIjoxNzA2MDQ1MzQ4LCJpYXQiOjEzOTA1MTI1NDh9.D1fS1h7NmM9OgFAe7tnsF5GNT8yN89Lnhi-Hd-R7w4I';
      
      auth0.getDelegationToken(targetClientId, id_token, function (err, delegationResult) {
        expect(delegationResult.id_token).to.exist;
        expect(delegationResult.token_type).to.eql('Bearer');
        expect(delegationResult.expires_in).to.eql(36000);
        done();
      });
    });
  });

  /*if (!navigator.userAgent.match(/iPad|iPhone|iPod/g)) {
    it('should return empty SSO data after logout', function (done) {
      forceLogout('aaa.auth0.com', function () {
        var auth0 = Auth0({
          clientID:     'aaaabcdefgh',
          callbackURL:  'https://myapp.com/callback',
          domain:       'aaa.auth0.com'
        });

        auth0.getSSOData(function (err, ssoData) {
          expect(ssoData.sso).to.eql(false);
          done();
        });
      });
    });
  }*/

});
