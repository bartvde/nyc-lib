/**
 * @module nyc/ol/source/FilterAndSort
 */

import $ from 'jquery'

import {get as olProjGetProjection} from 'ol/proj'
import OlGeomLineString from 'ol/geom/LineString'
import OlProjProjection from 'ol/proj/Projection'
import AutoLoad from 'nyc/ol/source/AutoLoad'

import nyc from 'nyc'
import {get as olProjGet} from 'ol/proj'
import {register as olProjRegister} from 'ol/proj/proj4'

const proj4 = nyc.proj4
olProjRegister(proj4)

/**
 * @desc Class to auto load all features from a URL
 * @public
 * @class
 * @extends ol.source.Vector
 * @see http://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html
 */
class FilterAndSort extends AutoLoad {
  /**
   * @desc Create an instance of FilterAndSort
   * @public
   * @constructor
   * @param {olx.source.VectorOptions} options Constructor optionss
   */
  constructor(options) {
    super(options)
    /**
     * @private
     * @member {Array<ol.Feature>}
     */
    this.allFeatures = options.features || null
    this.on('change:autoload-complete', $.proxy(this.storeFeatures, this))
  }
  /**
   * @desc Filters the features of this source
   * @public
   * @method
   * @param {Array<Array<module:nyc/ol/source/FilterAndSort~FilterAndSort.Filter>>} filters Used to filter features by attributes
   * @return {Array<ol.Feature>} An array of features contained in this source that are the result of the intersection of the applied filters
   */
  filter(filters) {
    const filteredFeatures = this.allFeatures.filter(feature => {
      return filters.every(fltrs => {
        return fltrs.some(flt => {
          return $.inArray(feature.get(flt.property), flt.values) > -1

        })
      })
    })
    this.clear(true)
  	this.addFeatures(filteredFeatures)
    return filteredFeatures
  }
  /**
   * @desc Sort features by distance from a coordinate
   * @public
   * @method
   * @param {ol.Coordinate} coordinate The coordinate from which to measure distance to features
   * @return {Array<ol.Feature>} The features, each decorated with a getDistance function that returns a {@link module:nyc/ol/source/FilterAndSort~FilterAndSort.Distance} object
   */
  sort(coordinate) {
    const features = this.getFeatures()
    features.sort((f0, f1) => {
      const geom0 = f0.getGeometry()
      const geom1 = f1.getGeometry()
      const dist0 = this.distance(coordinate, f0.getGeometry())
      const dist1 = this.distance(coordinate, f1.getGeometry())
      f0.set('__distance', dist0)
      f1.set('__distance', dist1)
      $.extend(f0, FilterAndSort.DistanceDecoration)
      $.extend(f1, FilterAndSort.DistanceDecoration)
      if (dist0.distance < dist1.distance) {
        return -1
      }else if (dist0.distance > dist1.distance) {
        return 1
      }
			return 0
    })
    return features
  }
  /**
   * @private
   * @method
   * @param {ol.Coordinate} coordinate 
   * @param {ol.geom.Geometry} geom 
   * @return {module:nyc/FilterAndSort~FilterAndSort.Distance}
   */
  distance(coordinate, geom) {
    const line = new OlGeomLineString([coordinate, geom.getClosestPoint(coordinate)])
    const projections = this.projections(this.getFormat())
    let units
    if (projections[0]) {
      line.transform(projections[1], projections[0])
      units = projections[0].getUnits()
    }
    return {distance: line.getLength(), units: units}
  }
  /**
   * @private
   * @method
   * @param {ol.format.Feature} format 
   * @return {Array<ol.proj.Projection>}
   */
  projections(format) {
    const parentFormat = format ? format.parentFormat : null
    let dataProj
    let featureProj
    if (parentFormat) {
      dataProj = olProjGet(parentFormat.defaultDataProjection)
      featureProj = olProjGet(parentFormat.defaultFeatureProjection || 'EPSG:3857')
    } else if (format) {
      dataProj = olProjGet(format.defaultDataProjection)
      featureProj = olProjGet(format.defaultFeatureProjection || 'EPSG:3857')
    }
    return [olProjGetProjection(dataProj), olProjGetProjection(featureProj)]
  }
  /**
   * @private
   * @method
   */
  storeFeatures() {
    this.allFeatures = this.getFeatures()
  }
}

/**
 * @public
 * @typedef {Object}
 * @property {number} distance The distance
 * @property {string} units The distance units
 */
FilterAndSort.Distance

/**
 * @desc Argument object for {@link module:nyc/ol/source/FilterAndSort~FilterAndSort#filter}
 * @public
 * @typedef {Object}
 * @property {string} property The property name on which to filter features
 * @property {Array<string>} values The values used to filter features 
 */
FilterAndSort.Filter

/**
 * @desc Mixin for features
 * @private
 * @typedef {Object<string, function>}
 */
FilterAndSort.DistanceDecoration = {
  /**
   * @desc Mixin for features
   * @private
   * @method 
   * @return {module:nyc/FilterAndSort~FilterAndSort.Distance}
   */
  getDistance() {
    return this.get('__distance')
  }
}

export default FilterAndSort
