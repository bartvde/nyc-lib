/**
 * @module nyc/ol/ZoomSearch
 */

import $ from 'jquery'

import OlGeoJSON from 'ol/format/GeoJSON'
import {getCenter as olExtentGetCenter} from 'ol/extent'

import NycZoomSearch from 'nyc/ZoomSearch'
import NycLocator from 'nyc/Locator'

/**
 * @desc Class for providing a set of buttons to zoom and search.
 * @public
 * @class
 * @extends {module:nyc/ZoomSearch~ZoomSearch}
 * @fires module:nyc/ZoomSearch~ZoomSearch#search
 * @fires module:nyc/ZoomSearch~ZoomSearch#geolocate
 * @fires module:nyc/ZoomSearch~ZoomSearch#disambiguated
 */
class ZoomSearch extends NycZoomSearch {
  /**
   * @desc Create an instance of ZoomSearch
   * @constructor
   * @param {ol.Map} map The OpenLayers map that will be controlled
   */
  constructor(map) {
    super($(map.getTargetElement()).find('.ol-overlaycontainer-stopevent'))
    /**
  	 * @private
  	 * @member {ol.Map}
  	 */
  	this.map = map
    /**
  	 * @private
  	 * @member {ol.View}
  	 */
  	this.view = map.getView()
    /**
  	 * @private
  	 * @member {ol.format.GeoJSON}
  	 */
  	this.geoJson = new OlGeoJSON()
  	this.getContainer().on('click dblclick mouseover mousemove', () => {
      $('.f-tip').hide()
    })
  }
	/**
	 * @public
	 * @override
	 * @method
	 * @param {ol.Feature} feature The feature object
	 * @param {module:nyc/ZoomSearch~ZoomSearch.FeatureSearchOptions} options Describes how to convert feature
	 * @return {module:nyc/Locator~Locator.Result} The location
	 */
	featureAsLocation(feature, options) {
		const geom = feature.getGeometry()
		return {
			name: options.nameField ? feature.get(options.nameField) : feature.getName(),
			coordinate: olExtentGetCenter(geom.getExtent()),
			geometry: JSON.parse(this.geoJson.writeGeometry(geom)),
			data: feature.getProperties(),
			type: 'geocoded',
			accuracy: NycLocator.Accuracy.HIGH
		}
	}
	/**
	 * @desc Handle the zoom event triggered by user interaction
	 * @public
	 * @override
	 * @method
	 * @param {jQuery.Event} event The event triggered by the zoom buttons
	 */
	zoom(event) {
		this.view.animate({
      zoom: this.view.getZoom() + ($(event.target).data('zoom-incr') * 1)
    })
	}
}

export default ZoomSearch
