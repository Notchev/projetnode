import express = require('express')
import path from "path";
import { UserHandler, User } from './user'
import session = require('express-session')
import levelSession = require('level-session-store')

const app = express()
const port: string = process.env.PORT || '1212'
const authRouter = express.Router()
const dbUser: UserHandler = new UserHandler('./db/users')
const LevelStore = levelSession(session)


app.set( "views", path.join( __dirname, "views" ) );
app.set( "view engine", "ejs" );

app.get('/', (req: any, res: any) => {
  res.render( "index.ejs") ; 
})

app.listen(port, (err: Error) => {
  if (err) {
    throw err
  }
  console.log(`server is listening on port ${port}`)
})

/* USER */

app.use(session({
	secret: 'my very secret phrase',
	store: new LevelStore('./db/sessions'),
	resave: true,
	saveUninitialized: true
}))


authRouter.get('/auth', (req: any, res: any) => {
	res.render('auth')
})

authRouter.get('/signup', (req: any, res: any) => {
	res.render('signup')
})

authRouter.get('/logout', (req: any, res: any) => {
	delete req.session.loggedIn
	delete req.session.user
	res.redirect('/auth')
})

app.post('/auth', (req: any, res: any, next: any) => {
	dbUser.get(req.body.username, (err: Error | null, result?: User) => {
		if (err) next(err)
		if (result === undefined || !result.validatePassword(req.body.password)) {
			res.redirect('/auth')
		} else {
			req.session.loggedIn = true
			req.session.user = result
			res.redirect('/')
		}
	})
})

app.use(authRouter)

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

userRouter.get('/:username', (req: any, res: any, next: any) => {
	dbUser.get(req.params.username, function (err: Error | null, result?: User) {
		if (err || result === undefined) {
			res.status(404).send("user not found")
		} else res.status(200).json(result)
	})
})

app.use('/user', userRouter)

const authCheck = function (req: any, res: any, next: any) {
	if (req.session.loggedIn) {
		next()
	} else res.redirect('/auth')
}

app.get('/', authCheck, (req: any, res: any) => {
	res.render('index', { name: req.session.username })
})