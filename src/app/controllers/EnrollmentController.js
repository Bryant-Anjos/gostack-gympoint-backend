import { parseISO, isBefore, addMonths, endOfDay } from 'date-fns'
import * as Yup from 'yup'
import { Op } from 'sequelize'

import Enrollment from '../models/Enrollment'
import Student from '../models/Student'
import Plan from '../models/Plan'
import User from '../models/User'

import EnrollmentMail from '../jobs/EnrollmentMail'
import Queue from '../../lib/Queue'

class EnrollmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .integer()
        .required(),
      plan_id: Yup.number()
        .integer()
        .required(),
      start_date: Yup.date().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' })
    }

    const { student_id, plan_id, start_date } = req.body

    /**
     * Check for past dates
     */
    if (isBefore(parseISO(start_date), new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted.' })
    }

    /**
     * Check if student exists
     */
    const student = await Student.findOne({
      where: { id: student_id, user_id: req.userId },
    })

    if (!student) {
      return res.status(400).json({ error: "Student doesn't exists." })
    }

    /**
     * Check if plan exists
     */
    const plan = await Plan.findOne({
      where: { id: plan_id, user_id: req.userId },
    })

    if (!plan) {
      return res.status(400).json({ error: "Plan doesn't exists." })
    }

    /**
     * Generate enrollment's end date
     */
    const { duration, price: monthlyPrice } = plan

    const end_date = addMonths(endOfDay(parseISO(start_date)), duration)

    /**
     * Check if enrollment exists
     */
    const enrollmentExists = await Enrollment.findOne({
      where: { student_id, end_date: { [Op.gt]: start_date }, active: true },
    })

    if (enrollmentExists) {
      return res.status(400).json({ error: 'Enrollment already exists.' })
    }

    /**
     * Generate enrollment's price
     */
    const price = monthlyPrice * duration

    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    })

    await Queue.add(EnrollmentMail.key, {
      student,
      plan,
      start_date,
      end_date,
      price,
    })

    const { id, enable } = enrollment
    const { title } = plan
    const { name, birthday, age, heigth, weigth } = student

    return res.json({
      id,
      plan_id,
      student_id,
      start_date,
      end_date,
      price,
      enable,
      plan: {
        id: plan_id,
        price: monthlyPrice,
        duration,
        title,
      },
      student: {
        id: student_id,
        name,
        birthday,
        age,
        heigth,
        weigth,
      },
    })
  }

  async index(req, res) {
    const { page = 1 } = req.query

    const enrollments = await Enrollment.findAll({
      where: { student_id: { [Op.ne]: null }, active: true },
      order: ['start_date'],
      limit: 10,
      offset: (page - 1) * 10,
      attributes: ['id', 'start_date', 'end_date', 'price', 'enable'],
      include: [
        {
          where: { user_id: { [Op.ne]: null } },
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'birthday', 'height'],
          include: [
            {
              where: { id: req.userId },
              model: User,
              as: 'user',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title'],
        },
      ],
    })

    return res.json(enrollments)
  }

  async show(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.id, {
      where: { student_id: { [Op.ne]: null }, active: true },
      attributes: ['id', 'start_date', 'end_date', 'price', 'enable'],
      include: [
        {
          where: { user_id: { [Op.ne]: null } },
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'birthday', 'height', 'weight'],
          include: [
            {
              where: { id: req.userId },
              model: User,
              as: 'user',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
      ],
    })

    if (!enrollment) {
      return res.status(400).json({ error: "Enrollment doesn't exists." })
    }

    return res.json(enrollment)
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number().integer(),
      start_date: Yup.date(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' })
    }

    const { id } = req.params

    const enrollment = await Enrollment.findByPk(id, {
      include: [{ model: Student, as: 'student' }],
    })

    if (!enrollment) {
      return res.status(400).json({ error: "Enrollment doesn't exists." })
    }

    if (enrollment.student.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: "You don't have permission to do this." })
    }

    const {
      plan_id = enrollment.plan_id,
      start_date = enrollment.start_date,
    } = req.body

    const plan = await Plan.findOne({
      where: { id: plan_id, user_id: req.userId },
    })

    if (!plan) {
      return res.status(400).json({ error: "Plan doesn't exists." })
    }

    if (start_date !== enrollment.start_date) {
      if (isBefore(parseISO(start_date), new Date())) {
        return res.status(400).json({ error: 'Past dates are not permitted.' })
      }
    }

    const { duration, price: monthlyPrice } = plan

    const end_date = addMonths(endOfDay(parseISO(start_date)), duration)

    const price = monthlyPrice * duration

    await enrollment.update({
      plan_id,
      start_date,
      end_date,
      price,
    })

    const { title } = plan

    return res.json({
      id,
      plan_id,
      start_date,
      end_date,
      price,
      plan: {
        id: plan_id,
        price: monthlyPrice,
        duration,
        title,
      },
    })
  }

  async delete(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.id, {
      include: [{ model: Student, as: 'student' }],
    })

    if (!enrollment) {
      return res.status(400).json({ error: "Enrollment doesn't exists." })
    }

    if (enrollment.student.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: "You don't have permission to do this." })
    }

    await enrollment.update({ active: false })

    return res.json(enrollment)
  }
}

export default new EnrollmentController()
