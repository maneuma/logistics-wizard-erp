// Licensed under the Apache License. See footer for details.
var supertest = require('supertest');
var async = require('async');

describe('Validates the Retail Store Manager', function () {

  var loopback;
  var app;
  var api;

  before(function (done) {
    loopback = require('loopback');
    app = require('..');
    app.use(loopback.rest());
    api = supertest(app);

    async.waterfall([
      function (callback) {
          app.models.ERPUser.create({
            email: "retailmanager@acme.com",
            username: "Retail Store Manager",
            password: "retail"
          }, function (err, user) {
            callback(err, user);
          });
      },
      function (user, callback) {
          app.models.Role.find({
            where: {
              name: app.models.ERPUser.RETAIL_STORE_MANAGER_ROLE
            }
          }, function (err, roles) {
            console.log("Assigning role", roles[0].name, "to", user.email);
            roles[0].principals.create({
              principalType: app.models.RoleMapping.USER,
              principalId: user.id
            }, function (err, principal) {
              callback();
            });
          });
      }],
      function (err, result) {
        done(err);
      });
  });

  after(function (done) {
    app.models.ERPUser.destroyAll(function (err, info) {
      done(err);
    });
  });

  it('can NOT retrieve products without being logged', function (done) {
    api.get("/Products")
      .expect(401)
      .end(function (err, res) {
        done(err);
      });
  });

  it('can login with proper credentials', function (done) {
    api.post("/Users/login")
      .set('Content-Type', 'application/json')
      .send('{"email": "retailmanager@acme.com", "password": "retail"}')
      .expect(200)
      .end(function (err, res) {
        // capture the token
        api.loopbackAccessToken = res.body.id;
        done(err);
      });
  });

  it('can retrieve distribution centers when logged', function (done) {
    api.get("/DistributionCenters")
      .set("Authorization", api.loopbackAccessToken)
      .expect(200)
      .end(function (err, res) {
        done(err);
      });
  });

  it('can retrieve inventories when logged', function (done) {
    api.get("/Inventories")
      .set("Authorization", api.loopbackAccessToken)
      .expect(401)
      .end(function (err, res) {
        done(err);
      });
  });

  it('can retrieve products when logged', function (done) {
    api.get("/Products")
      .set("Authorization", api.loopbackAccessToken)
      .expect(200)
      .end(function (err, res) {
        done(err);
      });
  });

  it('can retrieve retailers when logged', function (done) {
    api.get("/Retailers")
      .set("Authorization", api.loopbackAccessToken)
      .expect(200)
      .end(function (err, res) {
        done(err);
      });
  });

  it('can retrieve shipments when logged', function (done) {
    api.get("/Shipments")
      .set("Authorization", api.loopbackAccessToken)
      .expect(200)
      .end(function (err, res) {
        done(err);
      });
  });

  it('can NOT create a new shipment when logged', function (done) {
    api.post("/Shipments")
      .set("Authorization", api.loopbackAccessToken)
      .send({
        "status": "NEW",
        "fromId": "0",
        "toId": "1"
      })
      .expect(401)
      .end(function (err, res) {
        done(err);
      });
  });

  it('can NOT retrieve suppliers when logged', function (done) {
    api.get("/Suppliers")
      .set("Authorization", api.loopbackAccessToken)
      .expect(401)
      .end(function (err, res) {
        done(err);
      });
  });

});
//------------------------------------------------------------------------------
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------
