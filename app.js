var createError = require('http-errors');
var express = require('express');
var logger = require('morgan');
var cors = require('cors');
var path = require('path')


var getRouter = require('./routes/getRouter');
var postRouter = require('./routes/postRouter');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
// app.use(bodyParser());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(cors());
var corsOptions = {
  origin: 'http://localhost:3001',
  optionsSuccessStatus: 200
}
app.use(express.static(path.join(__dirname, 'profile')));
// app.use((req, res) => {
//   if(req.method === 'OPTIONS'){
//     console.log('!OPTIONS');
//     var headers = {}
//     headers['Access-Control-Allow-Origin'] = req.headers.origin ;
//     headers['Access-Control-Allow-Methods'] = "POST, GET, PUT, DELETE, OPTIONS" ;
//     headers['Access-Control-Allow-Credentials'] = false ;
//     headers['Access-Control-Max-Age'] = '86400' ;
//     headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, x-token' ;
//     res.writeHead(200, headers) ;
//     res.end() ;
//   }
// })

app.get('/*', cors(corsOptions), getRouter)
app.post('/*', cors(corsOptions), postRouter)
// app.post('/createAcct', cors(corsOption), [check('firstname').isAlpha().withMessage('Must be only alphabetical chars').isLength({ min: 3}).withMessage('Must be atleast 5 char long'),
// check('lastname').isAlpha().withMessage('Must be only alphabetical chars').isLength({ min: 5}).withMessage('Must be atleast 5 char long'),
// check('email').isEmail(),check('mobile').isMobilePhone(),check('password').isAlphanumeric()], (req, res, next) => {
// let  form = formidable.IncomingForm();
// form.parse(req, (err, fields, files) => {
//   const {firstname, lastname, email, mobile, password} = fields;
//           console.log(firstname, lastname, email, mobile, password);
//   let fileDirectory = path.join(__dirname, 'profile',files.profile.name);
//   try{
//     fs.access(fileDirectory, fs.F_OK, (err) => {
//       if(err){
//         let mailMobChk = isEmail.isEmail;
//         mailMobChk(connection, email, (responds) => {
//           if(responds){
//             res.json({status: false, msg: 'Email already exist!'})
//           }else{
//             mailMobChk(connection, mobile, (row) => {
//               if(row){
//                 res.json({status: false, msg: 'Mobile number already exist!'})
//               }else{
//                 let oldpath = files.profile.path;
//                 let date = new Date();
//                 let hr = date.getHours();
//                 let min = date.getMinutes();
//                 let sec = date.getSeconds();
//                 let msec = date.getMilliseconds();
//                 let day = date.getDate();
//                 let mon = date.getMonth()+1;
//                 let yr = date.getFullYear();
//                 day = day < 10 ? `0${day}`: day ;
//                 mon = mon < 10 ? `0${mon}`: mon ;
//                 hr = hr < 10 ? `0${hr}`: hr ;
//                 min = min < 10 ? `0${min}`: min ;
//                 sec = sec < 10 ? `0${sec}`: sec ;
//                 msec = msec < 10 ? `0${msec}`: msec ;
//                 let today = `${msec}-${sec}-${min}-${hr}-${day}-${mon}-${yr}`;
//                 let newpath = path.join(__dirname, 'profile', `${today}${files.profile.name}`);
//                 connection.query(process.insert('user', ['FirstName', 'LastName','Email', 'Mobile', 'Password','Pix']),
//                     [firstname,lastname,email,mobile,password,`${today}${files.profile.name}`], function (err, rows, fields) {
//                     if (err) throw err

//                     console.log('The solution is successful ')
//                   })
//                   connection.end();
//                 fs.rename(oldpath, newpath, (err) => {
//                   if(err) throw err;
//                   console.log('file uploaded')
                  
//                 })
//                 res.json({ status: false, msg: 'Account created'})
//               }
//             })
//           }
//         })
        
//       }else{
//         console.log('file exist!')
//         res.json({ status: false, msg: 'File already exist'});
//       }
      
//     })  
//   }catch(err){
//     console.log(err)
//   }
   
// })

// })

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
