const chroma = require('chroma-js')
const { getSecondColor } = require('./index')

test('get second color for red with ratio 4.5 to be 21, 21, 21', () => {
  const actual = getSecondColor(chroma(255, 0, 0), 4.5)
  const expected = [chroma(21, 21, 21)]
  expect(actual).toStrictEqual(expected);
});
