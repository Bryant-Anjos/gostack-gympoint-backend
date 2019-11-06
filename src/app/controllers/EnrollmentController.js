import { parseISO, isBefore, addMonths, endOfDay } from 'date-fns'
import * as Yup from 'yup'
import { Op } from 'sequelize'

import Enrollment from '../models/Enrollment'
import Student from '../models/Student'
import Plan from '../models/Plan'
import User from '../models/User'

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
    const studentExists = await Student.findOne({
      where: { id: student_id, user_id: req.userId },
    })

    if (!studentExists) {
      return res.status(400).json({ error: "Student doesn't exists." })
    }

    /**
     * Check if plan exists
     */
    const planExists = await Plan.findOne({
      where: { id: plan_id, user_id: req.userId },
    })

    if (!planExists) {
      return res.status(400).json({ error: "Plan doesn't exists." })
    }

    /**
     * Generate enrollment's end date
     */
    const { duration, price: monthlyPrice } = planExists

    const end_date = addMonths(endOfDay(parseISO(start_date)), duration)

    /**
     * Check if enrollment exists
     */
    const enrollmentExists = await Enrollment.findOne({
      where: { student_id, end_date: { [Op.gt]: start_date } },
    })

    if (enrollmentExists) {
      return res.status(400).json({ error: 'Enrollment already exists.' })
    }

    /**
     * Generate enrollment's price
     */
    const price = monthlyPrice * duration

    await Enrollment.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    })

    return res.json({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    })
  }

  async index(req, res) {
    const { page = 1 } = req.query

    const enrollments = await Enrollment.findAll({
      where: { student_id: { [Op.ne]: null } },
      order: ['start_date'],
      limit: 10,
      offset: (page - 1) * 10,
      attributes: ['id', 'start_date', 'end_date', 'price'],
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
      where: { student_id: { [Op.ne]: null } },
      attributes: ['id', 'start_date', 'end_date', 'price'],
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

    if (!enrollment) {
      return res.status(400).json({ error: "Enrollment doesn't exists." })
    }

    return res.json(enrollment)
  }
}

export default new EnrollmentController()
