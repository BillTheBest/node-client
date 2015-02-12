var assert = require('chai').assert;
var flowthings = require('../flowthings');
var extend = require('lodash.assign');

var idEncoder = {
  parse: function(x) { return x },
  stringify: function(x) { return x }
};

function requestOk(opts, callback) {
  callback(null, 200, {}, { body: opts });
}

function requestRefs(opts, callback) {
  callback(null, 200, {}, { head: { references: 'refs' }, body: opts });
}

function requestError(status, error) {
  return function(opts, callback) {
    callback(null, status, {}, { head: { errors: [['error', error]] }, body: opts });
  };
}

function TestAPI(opts) {
  var creds = {
    account: 'test',
    token: 'test'
  };
  return flowthings.API(creds, extend({}, {
    hostname: 'test',
    encoder: idEncoder,
    request: requestOk,
    secure: false
  }, opts));
}

function deepEqualCallback(spec) {
  return function(err, resp) {
    assert.deepEqual(resp, spec);
  };
}

function defaultDeepEqualCallback(speca) {
  return function(specb) {
    return deepEqualCallback(extend({}, speca, specb));
  };
}

var defaultCallback = defaultDeepEqualCallback({
  creds: {
    account: 'test',
    token: 'test'
  },
  secure: false,
  hostname: 'test',
  method: 'GET',
  data: null,
  params: {},
});



describe('requests', function() {
  it('should support basic requests', function() {
    TestAPI().root.request({
      method: 'PUT',
      path: '/foo',
      data: 'foo',
      params: { foo: true }
    }, defaultCallback({
      method: 'PUT',
      path: '/v0.1/test/foo',
      data: 'foo',
      params: { foo: true },
    }));
  });

  it('should support read', function() {
    TestAPI().flow.read('foo', defaultCallback({
      method: 'GET',
      path: '/v0.1/test/flow/foo',
      params: {},
      data: null
    }));
  });

  it('should support find by ids', function() {
    TestAPI().flow.readMany(['foo', 'bar'], defaultCallback({
      method: 'MGET',
      path: '/v0.1/test/flow',
      params: {},
      data: ['foo', 'bar']
    }));
  });

  it('should support find many', function() {
    TestAPI().flow.findMany(defaultCallback({
      method: 'GET',
      path: '/v0.1/test/flow',
      params: {},
      data: null
    }));
  });

  it('should support an overloaded find', function() {
    TestAPI().flow.find('foo', defaultCallback({
      method: 'GET',
      path: '/v0.1/test/flow/foo',
      params: {},
      data: null
    }));
    TestAPI().flow.find(['foo', 'bar'], defaultCallback({
      method: 'MGET',
      path: '/v0.1/test/flow',
      params: {},
      data: ['foo', 'bar']
    }));
    TestAPI().flow.find(defaultCallback({
      method: 'GET',
      path: '/v0.1/test/flow',
      params: {},
      data: null
    }));
  });

  it('should support find with params', function() {
    TestAPI({ request: requestRefs }).flow.find({
      refs: true,
      limit: 10,
      only: ['name', 'path'],
      filter: {
        one: 1,
        two: { $lt: 2 },
        three: { $lte: 3 },
        four: { $gt: 4 },
        five: { $gte: 5 },
        six: /6/gim
      }
    }, function(err, resp) {
      assert.equal(resp[1], 'refs');
      defaultCallback({
        method: 'GET',
        path: '/v0.1/test/flow',
        params: {
          refs: 1,
          limit: 10,
          only: 'name,path',
          filter: "(one == 1)&&(two < 2)&&(three <= 3)&&(four > 4)&&(five >= 5)&&(six =~ /6/gim)"
        },
        data: null
      })(null, resp[0]);
    });
  });

  it('should support create', function() {
    TestAPI().flow.create({ displayName: 'foo' }, defaultCallback({
      method: 'POST',
      path: '/v0.1/test/flow',
      params: {},
      data: { displayName: 'foo' }
    }));
  });

  it('should support update', function() {
    TestAPI().flow.update({ id: 'foo', displayName: 'foo' }, defaultCallback({
      method: 'PUT',
      path: '/v0.1/test/flow/foo',
      params: {},
      data: { id: 'foo', displayName: 'foo' }
    }));
  });

  it('should support update many', function() {
    TestAPI().flow.updateMany([
      { id: 'foo', displayName: 'foo' },
      { id: 'bar', displayName: 'bar' }
    ], defaultCallback({
      method: 'MPUT',
      path: '/v0.1/test/flow',
      params: {},
      data: {
        foo: { id: 'foo', displayName: 'foo' },
        bar: { id: 'bar', displayName: 'bar' }
      }
    }));
  });

  it('should support an overloaded save', function() {
    TestAPI().flow.save({ displayName: 'foo' }, defaultCallback({
      method: 'POST',
      path: '/v0.1/test/flow',
      params: {},
      data: { displayName: 'foo' }
    }));
    TestAPI().flow.save({ id: 'foo', displayName: 'foo' }, defaultCallback({
      method: 'PUT',
      path: '/v0.1/test/flow/foo',
      params: {},
      data: { id: 'foo', displayName: 'foo' }
    }));
    TestAPI().flow.save([
      { id: 'foo', displayName: 'foo' },
      { id: 'bar', displayName: 'bar' }
    ], defaultCallback({
      method: 'MPUT',
      path: '/v0.1/test/flow',
      params: {},
      data: {
        foo: { id: 'foo', displayName: 'foo' },
        bar: { id: 'bar', displayName: 'bar' }
      }
    }));
  });

  it('should support destroy', function() {
    TestAPI().flow.delete('foo', defaultCallback({
      method: 'DELETE',
      path: '/v0.1/test/flow/foo',
      params: {},
      data: null
    }));
  });
});
