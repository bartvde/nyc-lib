import Locator from 'nyc/Locator'
import EventHandling from 'nyc/EventHandling'

test('constructor no projection', () => {
    const locator = new Locator()
    expect(locator instanceof EventHandling).toBe(true)
    expect(locator instanceof Locator).toBe(true)
    expect(locator.projection).toBe('EPSG:3857')
})

test('constructor has projection', () => {
    const locator = new Locator({projection: 'EPSG:2263'})
    expect(locator instanceof EventHandling).toBe(true)
    expect(locator instanceof Locator).toBe(true)
    expect(locator.projection).toBe('EPSG:2263')
})

test('not implemented methods', () => {
    const locator = new Locator()
    expect(() => {locator.search('')}).toThrow('Not implemented')
    expect(() => {locator.locate()}).toThrow('Not implemented')
    expect(() => {locator.track()}).toThrow('Not implemented')
})

test('accuracyDistance', () => {
  let locator = new Locator()
  expect(locator.accuracyDistance(100)).toBe(100)

  locator = new Locator({projection: 'EPSG:2263'})
  expect(locator.accuracyDistance(100).toFixed(1)).toBe('328.1')
})