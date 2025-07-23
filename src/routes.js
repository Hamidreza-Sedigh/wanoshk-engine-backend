const express = require('express');
const multer = require('multer');
const verifyToken = require('./config/verifyToken');

const UserController = require('./controllers/UserController');
const EventController = require('./controllers/EventController');
const DashboardController = require('./controllers/DashboardController');
const LoginController = require('./controllers/LoginController');
const RegistrationController = require('./controllers/RegistrationController');
const ApprovalController = require('./controllers/ApprovalController');
const RejectionController = require('./controllers/RejectionController');
const SourceController = require('./controllers/SourceController');
const uploadConfig = require('./config/upload');
const ContactUsController = require('./controllers/ContactUsController');
const EngineController = require('./controllers/EngineController');

const routes = express.Router();
const upload = multer(uploadConfig);


//routes.get('/status', (req, res)=>{  res.send({ status : 200}) }); // jean
routes.get('/status', EngineController.getStatus);
routes.post('/status', EngineController.updateStatus);

//TODO: add todo extension VSCODE
//new ones:
routes.get('/api/news/:newsId', DashboardController.getNewsById);


//login
routes.post('/login', LoginController.store);
//User
routes.post('/user/register', UserController.createUser);
routes.get('/user/:userId', UserController.getUserById);

//Dashboard:
routes.get('/dashboard/:sport', verifyToken, DashboardController.getAllEvents)
routes.get('/dashboard', verifyToken, DashboardController.getAllEvents)
routes.get('/user/events', verifyToken, DashboardController.getEventsByUserId)
routes.get('/event/:eventId',verifyToken, DashboardController.getEventById)

//sources:
console.log("test in routes.");
routes.post('/addSource', verifyToken, upload.single("thumbnail"), SourceController.createSource);
routes.get('/getAllSources', verifyToken, SourceController.getAllSources);
routes.get('/getDistinctSources', verifyToken, SourceController.getDistinctSources);
routes.get('/getOneSource/:sourceName', verifyToken, SourceController.getOneSource);

//infos:
routes.get('/getLastTime',  verifyToken, DashboardController.getLastTime);
routes.get('/getNewsCount', verifyToken, DashboardController.getNewsCounts);

//contacts:getAllSources getContacts
routes.get('/getContacts', verifyToken, ContactUsController.getContacts);

//Events:
routes.post('/event', verifyToken, upload.single("thumbnail"), EventController.createEvent)
routes.delete('/event/:eventId', verifyToken, EventController.delete)

//Registration
routes.post('/registration/:eventId', verifyToken, RegistrationController.create);
routes.get('/registration', verifyToken, RegistrationController.getMyRegistrations);
routes.get('/registration/:registration_id', RegistrationController.getRegistration)
routes.post('/registration/:registration_id/approvals', verifyToken, ApprovalController.approval);
routes.post('/registration/:registration_id/rejections', verifyToken, RejectionController.rejection);

// new: 
routes.put('/api/sources/toggle-status', SourceController.toggleStatus);

module.exports = routes;