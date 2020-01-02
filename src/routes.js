import { Router } from 'express'
import multer from 'multer'
import multerConfig from './config/multer'

import AnswerController from './app/controllers/AnswerController'
import CheckinController from './app/controllers/CheckinController'
import EnrollmentController from './app/controllers/EnrollmentController'
import FileController from './app/controllers/FileController'
import QuestionController from './app/controllers/QuestionController'
import PlanController from './app/controllers/PlanController'
import SessionController from './app/controllers/SessionController'
import StudentController from './app/controllers/StudentController'
import UserController from './app/controllers/UserController'
import StudentSessionController from './app/controllers/StudentSessionController'

import authMiddleware from './app/middleware/auth'

const routes = new Router()
const upload = multer(multerConfig)

routes.post('/users', UserController.store)
routes.post('/sessions', SessionController.store)

routes.post('/students/:id/sessions', StudentSessionController.store)

routes.use(authMiddleware)

routes.put('/users', UserController.update)

routes.post('/files', upload.single('file'), FileController.store)

routes.get('/students', StudentController.index)
routes.get('/students/:id', StudentController.show)
routes.post('/students', StudentController.store)
routes.put('/students/:id', StudentController.update)
routes.delete('/students/:id', StudentController.delete)

routes.get('/plans', PlanController.index)
routes.get('/plans/:id', PlanController.show)
routes.post('/plans', PlanController.store)
routes.put('/plans/:id', PlanController.update)
routes.delete('/plans/:id', PlanController.delete)

routes.get('/enrollments', EnrollmentController.index)
routes.get('/enrollments/:id', EnrollmentController.show)
routes.post('/enrollments', EnrollmentController.store)
routes.put('/enrollments/:id', EnrollmentController.update)
routes.delete('/enrollments/:id', EnrollmentController.delete)

routes.get('/help-orders', AnswerController.index)
routes.put('/help-orders/:id/answer', AnswerController.update)

routes.get('/checkins', CheckinController.index)
routes.post('/checkins', CheckinController.store)

routes.get('/questions', QuestionController.index)
routes.post('/questions', QuestionController.store)

export default routes
