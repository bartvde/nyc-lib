import $ from 'jquery'

import OlView from 'ol/view'
import OlMap from 'ol/map'
import OlFormatGeoJson from 'ol/format/geojson'
import OlStyleStyle from 'ol/style/style'
import OlStyleIcon from 'ol/style/icon'
import OlSourceVector from 'ol/source/vector'
import OlLayerVector from 'ol/layer/vector'

import NycMapLocator from 'nyc/MapLocator'
import MapLocator from 'nyc/ol/MapLocator'

let container
let view
let map
beforeEach(() => {
  container = $('<div></div>')
  $('body').append(container)
  view = new OlView({zoom: 10, center: [0, 0]})
  map = new OlMap({target: container.get(0), view})
})

afterEach(() => {
  container.remove()
})

test('constructor default zoom and style', () => {
  const mapLocator = new MapLocator({map: map})

  expect(mapLocator instanceof NycMapLocator).toBe(true)
  expect(mapLocator instanceof MapLocator).toBe(true)

  expect(mapLocator.map).toBe(map)
  expect(mapLocator.view).toBe(view)
  expect(mapLocator.zoom).toBe(17)
  expect(mapLocator.format instanceof OlFormatGeoJson).toBe(true)

  expect(mapLocator.layer instanceof OlLayerVector).toBe(true)
  expect(mapLocator.layer.getStyle()).toBe(MapLocator.LOCATION_STYLE)

  expect(mapLocator.source instanceof OlSourceVector).toBe(true)
  expect(mapLocator.source.getFeatures().length).toBe(0)
  expect(mapLocator.source.getFeatures().length).toBe(0)
})

test('constructor provided zoom and style', () => {
  const style = new OlStyleStyle({})

  const mapLocator = new MapLocator({
    map: map,
    style: style,
    zoom: 10
  })

  expect(mapLocator instanceof NycMapLocator).toBe(true)
  expect(mapLocator instanceof MapLocator).toBe(true)

  expect(mapLocator.map).toBe(map)
  expect(mapLocator.view).toBe(view)
  expect(mapLocator.zoom).toBe(10)
  expect(mapLocator.format instanceof OlFormatGeoJson).toBe(true)

  expect(mapLocator.layer instanceof OlLayerVector).toBe(true)
  expect(mapLocator.layer.getStyle()).not.toBe(MapLocator.LOCATION_STYLE)
  expect(mapLocator.layer.getStyle()).toBe(style)

  expect(mapLocator.source instanceof OlSourceVector).toBe(true)
  expect(mapLocator.source.getFeatures().length).toBe(0)
  expect(mapLocator.source.getFeatures().length).toBe(0)
})

test('zoomLocation point geom', () => {
  const callback = jest.fn()
  const data = {
    name: 'a name',
    coordinate: [10, 10]
  }

  view.animate = jest.fn(() => {
    map.dispatchEvent('moveend')
  })
  view.fit = jest.fn()

  const mapLocator = new MapLocator({map: map})

  mapLocator.zoomLocation(data, callback)

  expect(view.animate).toHaveBeenCalledTimes(1)
  expect(view.animate.mock.calls[0][0].center).toBe(data.coordinate)
  expect(view.animate.mock.calls[0][0].zoom).toBe(17)
  expect(view.fit).toHaveBeenCalledTimes(0)
  expect(callback).toHaveBeenCalledTimes(1)
})

test('zoomLocation not point geom', () => {
  const callback = jest.fn()
  const data = {
    name: 'a name',
    coordinate: [10, 10],
    geometry: {
      type: 'Polygon',
      coordinates: [[[0,0], [0,10], [10,0], [0,0]]]
    }
  }

  map.getSize = jest.fn(() => {
    return [100, 100]
  })
  view.animate = jest.fn()
  view.fit = jest.fn(() => {
    map.dispatchEvent('moveend')
  })

  const mapLocator = new MapLocator({map: map})

  mapLocator.zoomLocation(data, callback)

  expect(view.animate).toHaveBeenCalledTimes(0)
  expect(view.fit).toHaveBeenCalledTimes(1)
  expect(view.fit.mock.calls[0][0]).toEqual([0, 0, 10, 10])
  expect(view.fit.mock.calls[0][1].size).toEqual([100, 100])
  expect(view.fit.mock.calls[0][1].duration).toBe(500)
  expect(callback).toHaveBeenCalledTimes(1)
})
