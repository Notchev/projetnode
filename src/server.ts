import express = require('express')
import { MetricsHandler, Metric } from './metrics'
import bodyparser = require('body-parser')
import session = require('express-session')
import levelSession = require('level-session-store')
import { UserHandler, User } from './user'

const app = express()
const port: string = process.env.PORT || '8090'

const metrics = require('./metrics.ts')

const path = require('path')
const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')
const LevelStore = levelSession(session)
const dbUser: UserHandler = new UserHandler('./db/users')
const authRouter = express.Router()
 
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))


app.set('views', __dirname + "/view")
app.set('view engine', 'ejs')

/* METRICS */

app.post('/metrics/:id', (req: any, res: any) => {
	dbMet.save(req.params.id, req.body, (err: Error | null) => {
		if (err) throw err
		res.status(200).send('working')
	})
})

app.get('/metrics/:id', (req: any, res: any) => {
	dbMet.getAll(req.params.id, (err: Error | null, metrics: Metric[] | null) => {
			if (err) throw err
			if (metrics !== null) {
				let newdataobj : object[]= []
				metrics.sort(function(a : Metric, b : Metric) { 
				  if (Number(a.timestamp) > Number(b.timestamp)) {
					return 1;
				  }
				  if (Number(a.timestamp) < Number(b.timestamp)) {
					return -1;
				  }
				  return 0;
				});
				metrics.forEach((data)=> {
				  newdataobj.push({timestamp :Number(data.timestamp), value : Number(data.value)})
				})
				
			  }
			  
			})
		  })
		  




/* USER */

app.use(session({
	secret: 'my very secret phrase',
	store: new LevelStore('./db/sessions'),
	resave: true,
	saveUninitialized: true
}))

//ROUTER CLASS  ----------- GET FUNCTION --------------
authRouter.get('/', (req: any, res: any) => {
	res.render('home.ejs')
})

authRouter.get('/login', (req: any, res: any) => {
	let errormsg : string = ""
	res.render('login', {errormsg : errormsg} )
})

authRouter.get('/register', (req: any, res: any) => {
	res.render('register')
})

authRouter.get('/logout', (req: any, res: any) => {
	console.log('je suis laaaaa')
	delete req.session.loggedIn
	delete req.session.user
	res.redirect('/home')
})

//ROUTER CLASS  ----------- POST FUNCTION --------------

app.post('/login', (req: any, res: any, next: any) => {

	console.log('je suis là ')	
	dbUser.get(req.body.username, (err: Error | null, result?: User) => {
		console.log("ici"+req.body.password,req.body.username,req.body.email)
		if (result !== undefined && result !== null && result.validatePassword(req.body.password)===true){
			req.session.loggedIn = true
			req.session.user = result
			res.render('hello.ejs')
			console.log("okkkk")
		}
		else 
		{
			console.log("merde")
			res.render('home.ejs')
		}
	})
})

app.post('/register', (req: any, res: any, next: any) => {
	let errormsgregister : string = ""  //to print an error message 
	console.log('je suis register ')	
	dbUser.get(req.body.username, (err: Error | null, result?: User) => {
		if (err) next(err)
		{
			errormsgregister = "username already taken please chose another one"
			res.render('register.ejs')
		}
		if (req.body.username == "" || req.body.email == "" || req.body.password == "" ) {
			errormsgregister = "all fields are mandatory"
			res.render('register.ejs')
		} 
		else {
			const new_user : User = new User(req.body.username, req.body.email, req.body.password)
			dbUser.save(new_user, function (err: Error | null) {
				dbUser.get(req.body.username, (err: Error | null, result?: User) => {
					if (err) next(err)
					else 
					{
			req.session.loggedIn = true
			req.session.user = result
			res.redirect('/hello')
					}
		})
	})
}
})
})

app.post('/logout',  (req: any, res: any, next: any) => {
	console.log('okkkk')
	res.redirect('/home')
})

//Post delete metric
authRouter.post('/delete', (req: any, res: any, next: any) => {
	if (!isNaN(Number(req.body.timestamp)) && req.body.timestamp !=="") {
	  dbMet.delete(req.session.user.username, req.body.timestamp, (err: Error | null) => {
		if (err) throw err;
		res.redirect('/')
	  })
	}
  })
  
  //add new metric
  authRouter.post('/add', (req: any, res: any, next: any) => {
	if (req.body.timestamp !=="" && req.body.value !=="" && !isNaN(Number(req.body.value)) && !isNaN(Number(req.body.timestamp))) {
	  dbMet.add(req.session.user.username, req.body.timestamp, req.body.value)
	  res.redirect('home')
	}
  })
  
  //convert datetime
  authRouter.post('/convert', (req: any, res: any, next: any) => {
	var time : string = String(new Date(req.body.dateTime).getTime())
	var Datetime : string = "The timestamp of "+req.body.dateTime+" is : "+time+""
	var Timestamp : string = ""
	res.render('hello', { name: req.session.user.username, datetime : Datetime, timestamp : Timestamp})
  })
  
  //Post convert timestamp
  authRouter.post('/convert2', (req: any, res: any, next: any) => {
	var Datetime: string = ""
	var Timestamp : string = ""
	if (!isNaN(Number(req.body.timestamp)) && req.body.timestamp !== "") {
	  var time : string = String(new Date(Number(req.body.timestamp)).toLocaleString())
	  Timestamp = "The datetime of "+req.body.timestamp+" is : "+time+""
	}
	res.render('hello', { name: req.session.user.username, datetime : Datetime, timestamp : Timestamp})
  })
app.use(authRouter)



/////// NEW USER /////////////



const userRouter = express.Router()

userRouter.post('/', (req: any, res: any, next: any) => {
	dbUser.get(req.body.username, function (err: Error | null, result?: User) {
		if (!err || result !== undefined) {
			res.status(409).send("user already exists")
		} else {
			dbUser.save(req.body, function (err: Error | null) {

				if (err) next(err)

				else res.status(201).send("user persisted")
			})
		}
	})
})

userRouter.post('/logout', (req: any, res: any) => {
	res.render('home.ejs')
})

userRouter.get('/:username', (req: any, res: any, next: any) => {
	dbUser.get(req.params.username, function (err: Error | null, result?: User) {
		if (err || result === undefined) {
			res.status(404).send("user not found")
		} else res.status(200).json(result)
	})
})

app.use('/user', userRouter)

//Log in correctly working or not ? 
const authCheck = function (req: any, res: any, next: any) {
	if (req.session.loggedIn) {
		next()
	} else res.redirect('/home')
}
 

//redirecting to home profile (hello page)
app.get('/hello', authCheck, (req: any, res: any) => {

	console.log("je suis ici")
	console.log(req.session.user.username)
	res.render('hello.ejs', { name : req.session.user.username })
})


app.listen(port, (err: Error) => {
	if (err) {
		throw err
	}
	console.log(`server is listening on port ${port}`)
})