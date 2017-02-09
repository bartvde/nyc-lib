var nyc = nyc || {};
nyc.ol = nyc.ol || {};
nyc.ol.layer = nyc.ol.layer || {};

/** 
 * @public 
 * @namespace
 */
nyc.ol.layer.plow = {
	/**
	 * @desc Add PlowNYC layers to the map
	 * @public
	 * @function
	 * @param {ol.Map} map The map into which the layers will be added
	 * @return {nyc.ol.layer.Adds} The added layers
	 */
	addGroupTo: function(map){
		var priority = nyc.ol.layer.plow.priority.addTo(map);
		return nyc.ol.layer.group([priority]);
	}
};

/** 
 * @public 
 * @namespace
 */
nyc.ol.layer.plow.priority = {
	/**
	 * @desc Add PlowNYC priority layer to the map
	 * @public
	 * @function
	 * @param {ol.Map} map The map into which the layers will be added
	 * @return {nyc.ol.layer.Adds} The added layers
	 */
	addTo: function(map){
		var added = {groupLayers: [], proxyLayers: [], allLayers: [], tips: []};
	
		var priorityLyr = new ol.layer.VectorTile({
			source: new ol.source.VectorTile({
		        url: 'http://msdlva-geoapp01.csc.nycnet:83/geoserver/gwc/service/tms/1.0.0/plow%3ASNOW_PRIORITY@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
				tileGrid: nyc.ol.TILE_GRID,
				format: new ol.format.MVT()
			}),
			style: nyc.ol.style.plow.priority,
			extent: nyc.ol.Basemap.EXTENT,
			opacity: .6,
			visible: false
		});
		map.addLayer(priorityLyr);
		added.groupLayers.push(priorityLyr);
		added.allLayers.push(priorityLyr);
		priorityLyr.set('name', 'Snow Removal Designation');
	
		added.tips.push(
	        new nyc.ol.FeatureTip(map, [{layer: priorityLyr, labelFunction: function(){
				nyc.ol.layer.mixin(this, nyc.ol.layer.plow.priority.mixins);		
	        	return {cssClass: 'tip-plow', text: this.html()};
	        }}])
		);
		
		priorityLyr.html = function(feature, layer){
			if (layer === this && feature.get('layer') == 'SNOW_PRIORITY'){
				nyc.ol.layer.mixin(feature, nyc.ol.layer.plow.priority.mixins);		
				return feature.html();
			}
		};
		
		return added;
	},
	/**
	 * @private
	 * @member {Array<Object>}
	 */
	mixins: [
         {designation: {C: 'Critical', S: 'Sector', H: 'Haulster', V: 'Non-DSNY'}},
         new nyc.Content({tip: '<div class="plow"><b>${NAME}</b><br>${priority}</div>'}),
         {
        	 html: function(){
        		 this.embelish();
        		 return this.message('tip', this.getProperties());
        	 },
        	 embelish: function(){
        		 this.getProperties().priority = this.designation[this.get('PRIORITY')];
        	 }
    	 }
	]
};