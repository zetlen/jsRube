var parsers = {};

try {
   var pEsprima = require( 'esprima' );
   parsers.esprima = function(src, withLoc) {
      return pEsprima.parse(src, { loc: withLoc, ranges: withLoc });
   };
} catch ( e ) {}

try {
   var pAcorn = require( 'acorn' );
   parsers.acorn = function( src, withLoc ) {
      return pAcorn.parse(src, { locations: withLoc });
   };
} catch ( e ) {} 

try {
   var pLube = require( './lube.js' );
   parsers.lube = function( src, withLoc ) {
      return new pLube.Parser(src).parseProgram();
   }
} catch ( e ) {}

var fs = require( 'fs' );
function readFile(filePath) {
   try {
     return fs.readFileSync(filePath,'utf-8').toString();
   } catch ( e ) {
     console.log( "COULD NOT LOAD", filePath );
     return "";
   }
}

var SOURCES_ROOT = './sources';
var sources = {};

var files = fs .readdirSync ( SOURCES_ROOT );

var e = 0;

while ( e < files.length ) {
   if ( !fs.statSync (SOURCES_ROOT + '/' + files[e]).isDirectory() )  { 
     sources[files[e]] = readFile(SOURCES_ROOT+ '/' + files[e]);
     console.log( 'LOAD', files[e] );
   }

   e++ ;
}
  
sources['lube'] = readFile( './lube.js' );

var Benchmark = require( 'benchmark' ).Benchmark ;
var parserName, sourceName;

function parseLater( parserName, sourceName ) {
  return function() { return parsers[parserName](sources[sourceName], !false ); };

}
 
for ( sourceName in sources ) {
     var benchmarkSet = new Benchmark.Suite();
     for ( parserName in parsers ) {
        benchmarkSet.add( parserName, parseLater(parserName, sourceName) );
     }
     benchmarkSet.on( 'complete', function(r) {
        var currentTargets = r.currentTarget, i;
        i = 0;
        console.log( "-----------START---------\n",
                     "source: ", sourceName );
        while ( i < currentTargets.length ) { 
          console.log( currentTargets[i].stats.mean, "(" + currentTargets[i].name + ')' )
          i++;
        }
        console.log( "------------DONE---------\n\n");
     });
     
     benchmarkSet.run();
}


