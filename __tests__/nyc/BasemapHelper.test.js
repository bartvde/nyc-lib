import $ from 'jquery'

import BasemapHelper from 'nyc/BasemapHelper'

const mockJsonEvent = {
  originalEvent: {
    dataTransfer: {
      files: [{name: 'layer.json'}]
    }
  },
  preventDefault: jest.fn(),
  stopPropagation: jest.fn()
}
const mockShpEvent = {
  originalEvent: {
    dataTransfer: {
      files: [
        {name: 'layer.shp'},
        {name: 'layer.dbf'},
        {name: 'layer.shx'},
        {name: 'layer.prj'}
      ]
    }
  },
  preventDefault: jest.fn(),
  stopPropagation: jest.fn()
}
const mockStorage = {
  loadGeoJsonFile: jest.fn((map, callback, file) => {
    expect(map).toBe(BasemapHelper)
    expect(callback).toBeNull()
    expect(file).toBe(mockJsonEvent.originalEvent.dataTransfer.files[0])
  }),
  loadShapeFile: jest.fn((map, callback, files) => {
    expect(map).toBe(BasemapHelper)
    expect(callback).toBeNull()
    expect(files).toBe(mockShpEvent.originalEvent.dataTransfer.files)
  })
}

let target
beforeEach(() => {
  target = $('<div id="map"></div>')
  $('body').append(target)
})

afterEach(() => {
  target.remove()
})

test('hookupEvents', () => {
  expect.assertions(4)
  
  const loadLayer = BasemapHelper.loadLayer
  
  BasemapHelper.loadLayer = jest.fn()

  BasemapHelper.hookupEvents(target.get(0))

  target.trigger('drop')
  expect(BasemapHelper.loadLayer).toHaveBeenCalledTimes(1)
  expect(BasemapHelper.loadLayer.mock.calls[0][0].target).toBe(target.get(0))

  const dragHandler = jest.fn()

  target.on('dragover', dragHandler)
  target.trigger('dragover')
  expect(dragHandler).toHaveBeenCalledTimes(1)
  expect(dragHandler.mock.calls[0][0].isDefaultPrevented()).toBe(true)

  BasemapHelper.loadLayer = loadLayer
})

test('loadLayer event has dataTransfer', () => {
  expect.assertions(12) /* asseritons in mocks as well */

  BasemapHelper.storage = mockStorage

  BasemapHelper.hookupEvents(target.get(0))

  BasemapHelper.loadLayer(mockJsonEvent)
  expect(mockStorage.loadGeoJsonFile).toHaveBeenCalledTimes(1)
  expect(mockJsonEvent.preventDefault).toHaveBeenCalledTimes(1)
  expect(mockJsonEvent.stopPropagation).toHaveBeenCalledTimes(1)

  BasemapHelper.loadLayer(mockShpEvent)
  expect(mockStorage.loadShapeFile).toHaveBeenCalledTimes(1)
  expect(mockShpEvent.preventDefault).toHaveBeenCalledTimes(1)
  expect(mockShpEvent.stopPropagation).toHaveBeenCalledTimes(1)
})

test('loadLayer event has no dataTransfer', () => {
  expect.assertions(2)
  
  BasemapHelper.storage = mockStorage

  const mockEvent = {
    originalEvent: {},
    preventDefault: jest.fn(),
    stopPropagation: jest.fn()
  }

  BasemapHelper.hookupEvents(target.get(0))

  BasemapHelper.loadLayer(mockEvent)

  expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
  expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1)
})

test('loadLayer dataTransfer has no files', () => {
  expect.assertions(2)

  BasemapHelper.storage = mockStorage

  BasemapHelper.hookupEvents(target.get(0))

  const mockEvent = {
    originalEvent: {
      dataTransfer: {files: []}
    },
    preventDefault: jest.fn(),
    stopPropagation: jest.fn()
  }

  BasemapHelper.hookupEvents(target.get(0))

  BasemapHelper.loadLayer(mockEvent)

  expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
  expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1)
})

test('sortedPhotos', () => {
  expect.assertions(12)

  BasemapHelper.photos = {
    '1951': {
      get: (key) => {
        if (key === 'name')
          return '1951'
      }
    },
    '1996': {name: '1996'},
    '1924': {name: '1924'},
    '2004': {
      get: (key) => {
        if (key === 'name')
          return '2004'
      }
    },
    '2014': {name: '2014'},
    '2006': {name: '2006'},
    '2001-2': {name: '2001-2'},
    '2008': {name: '2008'},
    '2010-11': {name: '2010-11'},
    '2012': {
      get: (key) => {
        if (key === 'name')
          return '2012'
      }
    },
    '2016': {name: '2016'}
  }

  const sorted = BasemapHelper.sortedPhotos()

  expect(sorted[10]).toBe(BasemapHelper.photos['1924'])
  expect(sorted[9]).toBe(BasemapHelper.photos['1951'])
  expect(sorted[8]).toBe(BasemapHelper.photos['1996'])
  expect(sorted[7]).toBe(BasemapHelper.photos['2001-2'])
  expect(sorted[6]).toBe(BasemapHelper.photos['2004'])
  expect(sorted[5]).toBe(BasemapHelper.photos['2006'])
  expect(sorted[4]).toBe(BasemapHelper.photos['2008'])
  expect(sorted[3]).toBe(BasemapHelper.photos['2010-11'])
  expect(sorted[2]).toBe(BasemapHelper.photos['2012'])
  expect(sorted[1]).toBe(BasemapHelper.photos['2014'])
  expect(sorted[0]).toBe(BasemapHelper.photos['2016'])
  expect(sorted.length).toBe(11)
})
