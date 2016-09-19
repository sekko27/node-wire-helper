module.exports = ->
  factories:
    coc: (resolver, componentDef, wire) ->
      console.log 'place2', arguments
      resolver.resolve {}

