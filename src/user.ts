import { LevelDB } from "./leveldb"


export class User {

  // properties of the user 
  public username: string
  public email: string
  private password: string = ""

  //construct a new user bref decla quoi 
  constructor(username: string, email: string, password: string, passwordHashed: boolean = false) {
    this.username = username
    this.email = email

    if (!passwordHashed) {
      this.setPassword(password)
    } else this.password = password
  }


  //
  static fromDb(username: string, value: any): User {
    const [password, email] = value.split(":")
    return new User(username, email, password)
  }

  public setPassword(toSet: string): void {
    // Hash and set password
  }

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
    // TODO
  }

  constructor(path: string) {
    this.db = LevelDB.open(path)
  }
}