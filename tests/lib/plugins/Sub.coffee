{assert} = require 'chai'
{Runner} = require './../../../index'

describe 'Sub plugin factory', ->
  it 'should handle nested module references (sub0001)', (done) ->
    spec = require './../../contexts/sub0001'
    Runner spec, (err, ctx) ->
      assert.isNull err
      assert.isNotNull ctx
      assert.equal ctx.any, 'module-sub'
      done()
