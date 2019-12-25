import { UserHandler, User } from '../src/user'
import { MetricsHandler } from '../src/metrics'


const users = [
    new User("a", "a@a", "mdp"),
    new User("b", "b@b", "b")
  ];
  
const metrics1 = [
  {"timestamp":"1575242300000","value":"34"},
  {"timestamp":"1575932400000","value":"53"}
]

const metrics2 = [
  {"timestamp":"1575280400000","value":"9"},
  {"timestamp":"1575270100000","value":"56"}
]

const dbUser = new UserHandler('./db/users') //create or open a levelDB database
const dbMet: MetricsHandler = new MetricsHandler('./db/metrics') //create or open a levelDB database

users.forEach(user => {
  // Save user
  console.log('database populated ');
  dbUser.save(user, (err: Error | null) => {
      if (err) throw err;
  });
console.log(user)
  if (user.username === "user") {
    metrics1.forEach(metrics => {
      dbMet.add(user.username,metrics.timestamp, metrics.value)
    })
    console.log("metrics user1 OK")
  }
  else {
    metrics2.forEach(metrics => {
      dbMet.add(user.username,metrics.timestamp, metrics.value)
    })
    console.log("metrics user2 OK")
  }
})