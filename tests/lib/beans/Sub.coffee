{assert} = require 'chai'
{Runner} = require './../../../index'

describe 'Beans', ->
  it 'should provide mongoose connection factory', (done) ->
    spec =
      'wire-context-helper':
        module: "#{__dirname}/../../../index"
      mongoose:
        module: "#{__dirname}/../../mocks/Mongoose"
      db:
        sub:
          module: 'wire-context-helper#beans.MongooseConnectionFactory'
          args: [
            $ref: 'mongoose'
            {
              connection:
                url: 'mongo-url'
            }
          ]
    Runner spec, (err, ctx) ->
      assert.isNull err
      assert.isNotNull ctx
      done()
