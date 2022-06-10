const chroma = require('chroma-js')
const { getSecondColor, tweak } = require('./lib')

test('get second color for red with ratio 4.5 to be 21, 21, 21', () => {
  const actual = getSecondColor(chroma(255, 0, 0), 4.5)
  const expected = [chroma(21, 21, 21)]
  expect(actual).toStrictEqual(expected);
});

test('test tweak', () => {
  const actual = tweak(chroma(255, 0, 0), chroma(0, 0, 255), 4.5, 'rgb')

  expect(actual).toBe(undefined)
})