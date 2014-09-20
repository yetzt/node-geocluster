# geocluster

`geocluster` finds clusters in sets of coordinates. It's a port of [S-means](https://www.npmjs.org/package/smeans) by [Brian Hann](https://www.npmjs.org/~c0bra) (which itself is a [stdev](http://en.wikipedia.org/wiki/Standard_deviation)-driven form of [K-means](http://en.wikipedia.org/wiki/K-means)), but with two dimensions, Earth-[geodesic distance](http://en.wikipedia.org/wiki/Geodesics_on_an_ellipsoid) and properly working code.

## Install

```
npm install geocluster
```

## API

### result = geocluster(coordinates[, bias])

`coordinates` is an Array of `[lat, lon]` pairs.
`bias` is a factor the standard deviation gets multiplied with, which acts as threshold to determine if a coordinate belongs to a cluster.

`result` is an Array of cluster objects, which have `centroid` and `elements` properties. Example:

``` javascript
[{
	centroid: [1.0,1.0],
	elements: [
		[1.0,1.0], [0.9,1.1], [1.1,0.9]
	]
},{
	centroid: [2.0,2.0],
	elements: [
		[2.0,2.0], [1.9,2.1], [2.1,1.9]
	]
}]
``` 

## Sample Code

``` javascript

var geocluster = require("geocluster");

var coordinates = [ // array of lat-lon-pairs
	[<lat>, <lon>], 
	[<lat>, <lon>], 
	[<lat>, <lon>],
	// ...
];

var bias = 1.5; // multiply stdev with this factor, the smaller the more clusters

var result = geocluster(coordinates, bias); 

// result is an array of cluster objects with `centroid` and `elements` properties

```

## License

[Public Domain](http://unlicense.org/UNLICENSE)
