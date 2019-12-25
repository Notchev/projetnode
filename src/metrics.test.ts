import { expect } from 'chai'
import { Metric, MetricsHandler } from './metrics'
import { LevelDB } from "./leveldb"

const a: number = 0
const dbPath: string = 'db/test'
var dbMet: MetricsHandler

describe('Metrics', function () {
  before(function () {
    LevelDB.clear(dbPath)
    dbMet = new MetricsHandler(dbPath)
  })

  after(function () {
    dbMet.closeDB()
  })

  describe('#get', function () {
    it('should get empty array on non existing group', function () {
      dbMet.getAll("0",  function (err: Error | null, result?: Metric[] | null ) {
        expect(err).to.be.null
        expect(result).to.not.be.undefined
        expect(result).to.be.empty
      })
    })

    it('should save and get', function () {
      var met: Metric[] = [];
      met.push(new Metric('122211212', 10))
      dbMet.save("1", met, (err: Error | null) => {
        dbMet.getAll("1", function (err: Error | null, result?: Metric[] | null ) {

          expect(err).to.be.null
          expect(result).to.not.be.undefined
          console.log(result)
          if (result)
            expect(result[0].value).to.equal(10)
        })
      })
    })
  })
})

