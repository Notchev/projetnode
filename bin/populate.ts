import { UserHandler, User } from '../src/user'

const dbUser = new UserHandler('./db/users') //create or open a levelDB database

const users = [
    new User("a", "a@a", "a"),
    new User("b", "b@b", "b")
  ];
  
  //fonction parcours de l'array users
  users.forEach ( user => {
    dbUser.save(user, (err: Error | null) => {
      if (err) throw err
      console.log('Data populated')
      console.log(user)
  })
  })