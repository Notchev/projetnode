import { LevelDB } from "./leveldb"
import WriteStream from 'level-ws'


export class User {

  // properties of the user 
  public username: string
  public email: string
  private password: string = ""
 

  //construct a new user bref decla quoi 
  constructor(username: string, email: string, password: string, passwordHashed: boolean = false) {
    this.username = username
    this.email = email
    this.password = password 
    

    if (!passwordHashed) {
      this.setPassword(password)
    } else this.password = password
  }

  //New User
  static fromDb(username: string, value: any): User {
    const [password, email] = value.split(":")
    return new User(username, email, password)
  }

  //function to set password
  public setPassword(toSet: string): void {
    // Hash and set password
    this.password = toSet 
  }

    //function to get password
  public getPassword(): string {
    return this.password
  }

  public validatePassword(toValidate: String): boolean {
    if (this.getPassword() === toValidate) {

      return true
    }
    else {
      return false
    }
  }
}

export class UserHandler {
  public db: any
  
  constructor(path: string) {
    this.db = LevelDB.open(path)
  }

  public get(username: string, callback: (err: Error | null, result?: User) => void) {
    this.db.get(`user:${username}`, function (err: Error, data: any) {
      if (err) callback(err)
      else if (data === undefined) callback(null, data)
      callback(null, User.fromDb(username, data))
    })
  }

  public save(user: User, callback: (err: Error | null) => void) {
    //first we have the key then we have the value 
    this.db.put(`user:${user.username}`, `${user.getPassword}:${user.email}`, (err: Error | null) => {
      callback(err)
    })
  }

  public delete(username: string, callback: (err: Error | null) => void) {
   let key: string =`user:${username}`;
   this.db.del(key, function (err)
   {
     callback(err);
   });

  }
}