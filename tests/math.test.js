const { CtoFahren, FtoCelsius} = require('../src/math')

test('Calculate fahren conversion', ()=>{
    const tempF = CtoFahren(0)
    expect(tempF).toBe(32)
})

test('Calculate Celsius conversion', ()=>{
    const tempC = FtoCelsius(32)
    expect(tempC).toBe(0)
})