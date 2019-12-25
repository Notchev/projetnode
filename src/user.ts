import { LevelDB } from "./leveldb"
import WriteStream from 'level-ws'

export class UserHandler {
  public db: any
  
  constructor(dbPath: string) {
    this.db = LevelDB.open(dbPath)
  }

  public get(username: string, callback: (err: Error | null, result?: User) => void) {
    this.db.get(`user:${username}`, function (err: Error, data: any) {
      console.log("JBBBB"+username)
      if (err) callback(err)
      else if (data === undefined) callback(null, data)
      else callback(null, User.fromDb(username, data))
    })
  }

  public save(usersa: any, callback: (err: Error | null) => void) {
    var user = new User(usersa.username, usersa.email, usersa.password, false) 
    this.db.put(`user:${user.username}`, `${user.password}:${user.email}`, (err: Error | null) => {
      callback(err)
    })
  }

  public delete(usersa: any, callback: (err: Error | null) => void) {
    var user = new User(usersa.username, usersa.email, user.password, false) 
    this.db.del(`user:${user.username}`, `${user.getPassword}:${user.email}`, (err: Error | null) => {
   {
     callback(err);
   }
  
  })
}
}

export class User {
  // properties of the user 
  public username: string
  public email: string
  public password: string = ""
 
  //construct a new user bref decla quoi 
  constructor(username: string, email: string, password: string, passwordHashed: boolean = false) {
    this.username = username
    this.email = email
    this.password = password 

    if (!passwordHashed) {
      this.setPassword(password)
    } else this.password = password
  }
  //Spliting password and mail
  static fromDb(username: string, value: any): User {
    const [password, email] = value.split(":")
    return new User(username, email, password, true)
  }
  //function to set password
  public setPassword(toSet: string): void {
    // Hash and set password
    this.password = toSet 
  }
    
  
  public validatePassword(toValidate: String): boolean {
    return this.password == toValidate

  }
}
