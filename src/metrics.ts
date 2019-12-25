import LevelDB = require('./leveldb')
import WriteStream from 'level-ws'

export class Metric {
    public timestamp: string
    public value: number
  
    constructor(ts: string, v: number) {
      this.timestamp = ts
      this.value = v
    }

   
  }
  
export class MetricsHandler {
  private db: any 

  constructor(dbPath: string) {
    this.db = LevelDB.LevelDB.open(dbPath)
  }

    public save(key: string, metrics: Metric[],    callback: (error: Error | null) => void) {
      const stream = WriteStream(this.db)
      stream.on('error', callback)
      stream.on('close', callback)
      metrics.forEach((m: Metric) => {
        stream.write({ key: `metric:${key}${m.timestamp}`, value: m.value })
      })
      stream.end()
  }
  
  public delete(user : string, timestamp: string, callback: (error: Error | null) => void) {
    let key : string = "metric:"+user+":"+timestamp+""
    this.db.del(key,function (err) {
      callback(err);
  });
  }

  public add(user : string, timestamp: string, value : string) {
    let key : string = "metric:"+user+":"+timestamp+""
    let Value : string = value
    this.db.put(key,Value, (err)=>null)
  }

  public closeDB()
  {
    this.db.close()
  }

	public getAll(key: string, callback: (err: Error | null, result: Metric[] | null ) => void) {
    const stream = this.db.createReadStream()
    var met: Metric[] = []
    
    stream.on('error', callback)
      .on('data', (data: any) => {
        const [_, k, timestamp] = data.key.split(":")
        const value = data.value
        if (key != k) {
          console.log(`LevelDB error: ${data} does not match key ${key}`)
        } else {
          met.push(new Metric(timestamp, value))
        }
      })
      .on('end', (err: Error) => {
        callback(null, met)
      })
  }

}
//for only one key 
//let timestamp : string = data.key.split(':') [1]
