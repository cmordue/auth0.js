describe('Auth0 - User And Passwords', function () {
  var auth0 = new Auth0({
    domain:      'mdocs.auth0.com',
    callbackURL: 'http://localhost:3000/',
    clientID:    'ptR6URmXef0OfBDHK0aCIy7iPKpdCG4t'
  });

  describe('Login', function () {
    it('should call the callback when user/pass is wrong', function (done) {
      auth0.login({
        connection: 'tests',
        username: 'testttt@wrong.com',
        password: '12345'
      }, function (err) {
        expect(err.status).to.equal(401);
        expect(err.details.code).to.equal('invalid_user_password');
        done();
      });
    });

    it('should call the callback with err when the connection doesn\'t exists', function (done) {
      auth0.login({
        connection: 'testsw3eeasdsadsa',
        username: 'testttt@wrong.com',
        password: '12345'
      }, function (err) {
        expect(err.status).to.equal(404);
        expect(err.message).to.match(/connection not found/ig);
        done();
      });
    });

    it('should render wsfed form after successfull authentication', function (done) {
      auth0._renderAndSubmitWSFedForm = function (htmlForm) {
        expect(htmlForm).to.match(/<form/);
        done();
      };

      auth0.login({
        connection: 'tests',
        username: 'johnfoo@gmail.com',
        password: '12345'
      });
    });

    /*if (!navigator.userAgent.match(/iPad|iPhone|iPod/g)) {
      it('should return SSO data after successfull authentication', function (done) {
        forceLogout('mdocs.auth0.com', function () {
          var loginStarted;
          var iframe = document.createElement('iframe');
          iframe.name = 'test-iframe';
          iframe.style.display = 'none';
          iframe.onload = function() {
            if (!loginStarted) return;

            auth0.getSSOData(function (err, ssoData) {
              expect(ssoData.sso).to.eql(true);
              expect(ssoData.lastUsedClientID).to.eql('ptR6URmXef0OfBDHK0aCIy7iPKpdCG4t');
              expect(ssoData.lastUsedUsername).to.eql('johnfoo@gmail.com');
              expect(ssoData.lastUsedConnection).to.exist;
              expect(ssoData.lastUsedConnection.name).to.eql('tests');
              expect(ssoData.lastUsedConnection.strategy).to.eql('auth0');
              done();
            });
          };

          document.body.appendChild(iframe);

          auth0._renderAndSubmitWSFedForm = function (formHtml) {
            var div = document.createElement('div');
            div.innerHTML = formHtml;
            var form = document.body.appendChild(div).children[0];
            form.setAttribute('target', 'test-iframe');
            form.submit();
            loginStarted = true;
          };

          auth0.login({
            connection: 'tests',
            username:   'johnfoo@gmail.com',
            password:   '12345'
          });
        });
      });
    }*/
  });

  describe('Signup', function () {
    it('should render wsfed form after successfull signup', function (done) {
      auth0._renderAndSubmitWSFedForm = function (htmlForm) {
        expect(htmlForm).to.match(/<form/);
        done();
      };

      auth0.signup({
        connection: 'tests',
        username: 'johnfoo@gmail.com',
        password: '12345'
      }, function (err) {
        done(err);
      });
    });

    it('should fail when the username is null', function (done) {
      auth0.signup({
        connection: 'tests',
        username: null,
        password: '12345'
      }, function (err) {
        expect(err.status).to.equal(400);
        expect(err.message).to.exist;
        expect(err.details).to.exist;
        done();
      });
    });

    it('should handle server errors', function (done) {
      auth0.signup({
        connection: 'tests',
        username:   'pepo@example.com',
        password:   '12345'
      }, function (err) {
        expect(err.status).to.equal(500);
        expect(err.message).to.exist;
        expect(err.details).to.exist;
        done();
      });
    });

    it('should not render wsfed form after successfull signup if auto_login is false', function (done) {
      auth0._renderAndSubmitWSFedForm = function (htmlForm) {
        done(new Error('this should not be called'));
      };

      auth0.signup({
        connection: 'tests',
        username:   'johnfoo@gmail.com',
        password:   '12345',
        auto_login: false
      }, function (err) {
        done(err);
      });
    });
  });

  describe('Change Password', function () {
    it('should fail when the username is null', function (done) {
      auth0.changePassword({
        connection: 'tests',
        username:   null,
        password:   '12345'
      }, function (err) {
        expect(err.status).to.equal(400);
        expect(err).to.have.property('message');
        expect(err).to.have.property('details');
        done();
      });
    });

    //this timeout sometimes. I need to improve.
    it('should return OK after successfull operation', function (done) {
      auth0.changePassword({
        connection: 'tests',
        username:   'johnfoo@contoso.com',
        password:   '12345'
      }, function (err) {
        expect(err).to.be(null);
        done();
      });
    });

  });
});
