#!/usr/bin/env node

// degrees to radians polyfill
if (typeof(Number.prototype.toRad) === "undefined") Number.prototype.toRad = function(){ return this * Math.PI / 180; };

function geocluster(elements, bias){
	if (!(this instanceof geocluster)) return new geocluster(elements, bias);
	return this._cluster(elements, bias);
};

// geodetic distance approximation
geocluster.prototype._dist = function(lat1, lon1, lat2, lon2) {
	var dlat = (lat2 - lat1).toRad();
	var dlon = (lon2 - lon1).toRad();
	var a = (Math.sin(dlat/2) * Math.sin(dlat/2) + Math.sin(dlon/2) * Math.sin(dlon/2) * Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()));
	return (Math.round(((2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))) * 6371)*100)/100);
};

geocluster.prototype._centroid = function(set) {
	return set.reduce(function(s, e){
		return [(s[0]+e[0]),(s[1]+e[1])];
	}, [0,0]).map(function(e){
		return (e/set.length);
	});
}

geocluster.prototype._clean = function(data) {
	return data.map(function(cluster){
		return [cluster.centroid, cluster.elements];
	});
};

geocluster.prototype._cluster = function(elements, bias) {
	
	var self = this;
	
	// set bias to 1 on default
	if ((typeof bias !== "number") || isNaN(bias)) bias = 1;
	
	var tot_diff = 0;
	var diffs = [];
	var diff;

	// calculate sum of differences
	for (i = 1; i < elements.length; i++) {
		diff = self._dist(elements[i][0], elements[i][1], elements[i-1][0], elements[i-1][1]);
		tot_diff += diff;
		diffs.push(diff);
	}

	// calculate mean diff
	var mean_diff = (tot_diff / diffs.length);
	var diff_variance = 0;

	// calculate variance total
	diffs.forEach(function(diff){
		diff_variance += Math.pow(diff - mean_diff, 2);
	});
	
	// derive threshold from stdev and bias
	var diff_stdev = Math.sqrt(diff_variance / diffs.length);
	var threshold = (diff_stdev * bias);

	var cluster_map = [];
	
	// generate random initial cluster map
	cluster_map.push({
		centroid: elements[Math.floor(Math.random() * elements.length)],
		elements: []
	});

	// loop elements and distribute them to clusters
	var changing = true;
	while (changing === true) {

		var new_cluster = false;
		var cluster_changed = false;
		
		// iterate over elements
		elements.forEach(function(e, ei){

			var closest_dist = Infinity;
			var closest_cluster = null;
			
			// find closest cluster
			cluster_map.forEach(function(cluster, ci){
				
				// distance to cluster
				dist = self._dist(e[0], e[1], cluster_map[ci].centroid[0], cluster_map[ci].centroid[1]);
				
				if (dist < closest_dist) {
					closest_dist = dist;
					closest_cluster = ci;
				}
				
			});
			
			// is the closest distance smaller than the stddev of elements?
			if (closest_dist < threshold || closest_dist === 0) {

				// put element into existing cluster
				cluster_map[closest_cluster].elements.push(e);

			} else {
			
				// create a new cluster with this element
				cluster_map.push({
					centroid: e,
					elements: [e]
				});

				new_cluster = true;
				
			}
		
		});

		// delete empty clusters from cluster_map 
		cluster_map = cluster_map.filter(function(cluster){
			return (cluster.elements.length > 0);
		});
		
		// calculate the clusters centroids and check for change
		cluster_map.forEach(function(cluster, ci){
			var centroid = self._centroid(cluster.elements);
			if (centroid[0] !== cluster.centroid[0] || centroid[1] !== cluster.centroid[1]) {
				cluster_map[ci].centroid = centroid;
				cluster_changed = true;
			}
		});
		
		// loop cycle if clusters have changed
		if (!cluster_changed && !new_cluster) {
			changing = false;
		} else {
			// remove all elements from clusters and run again
			if (changing) cluster_map = cluster_map.map(function(cluster){
				cluster.elements = [];
				return cluster;
			});
		}
		
	}

	// compress result
	return cluster_map;

};

module.exports = geocluster;
