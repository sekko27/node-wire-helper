_ = require 'lodash'
chai = require 'chai'
chaiAsPromised = require 'chai-as-promised'
chai.use chaiAsPromised
chai.should()
Promise = require 'bluebird'
CoCModuleLoader = require './../../lib/loader/CoCModuleLoader'
pathModule = require 'path'
wire = require 'wire'

wireSubHash = (prop, factory) ->
  contextSpec =
    $plugins: [ module: "#{__dirname}/../../lib/plugins/Sub" ]
    hash:
      module: 'lib#model:SubHash'
    prop:
      sub:
        module: "hash##{prop}"
        factory: factory

  loader = new CoCModuleLoader()
  loader.logger =
    warn: ->
    info: ->
  loaderWrap = (m) -> loader.load(m)
  loader.registerModuleRoot("#{__dirname}/../loader/module-one")
    .then ->
      wire(contextSpec, require: loaderWrap)

describe 'Sub plugin', ->
  it 'should extract property from bean', ->
    wireSubHash('a', 'module').should.eventually.have.property('prop', 1)
  it 'should extract function from bean', ->
    wireSubHash('b', 'function').should.eventually.have.property('prop', 2)
  it 'should extract using module factory by default', ->
    wireSubHash('b', 'x').should.eventually.have.property('prop').that.a 'function'