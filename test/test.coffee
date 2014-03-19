console.log( "hello from coffee")
run = ->
  console.log("Your node.js details:")
  console.log("Version: " + process.version)
  console.log("Platform: " + process.platform)
  console.log("Architecture: " + process.arch)
  console.log("NODE_PATH: " + process.env.NODE_PATH)
 
exports.run = run  
