import { Op } from 'sequelize'
import * as Yup from 'yup'

import HelpOrder from '../models/HelpOrder'
import Student from '../models/Student'

import AnswerMail from '../jobs/AnswerMail'
import Queue from '../../lib/Queue'

class AnswerController {
  async index(req, res) {
    const helpOrders = await HelpOrder.findAll({
      where: { answer: null, student_id: { [Op.ne]: null } },
      attributes: ['id', 'question', 'created_at'],
      include: [
        {
          model: Student,
          as: 'student',
          where: { user_id: req.userId },
          attributes: ['id', 'name'],
        },
      ],
    })

    return res.json(helpOrders)
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' })
    }

    const helpOrder = await HelpOrder.findByPk(req.params.id, {
      attributes: ['id', 'question', 'answer', 'answer_at'],
      where: { student_id: { [Op.ne]: null } },
      include: [
        {
          model: Student,
          as: 'student',
          where: { user_id: req.userId },
          attributes: ['name', 'email'],
        },
      ],
    })

    if (!helpOrder) {
      return res.status(400).json({ error: "Help order doesn't exists." })
    }

    if (helpOrder.answer) {
      return res
        .status(401)
        .json({ error: 'This help order already has an answer.' })
    }

    await helpOrder.update({
      answer: req.body.answer,
      answer_at: new Date(),
    })

    await Queue.add(AnswerMail.key, {
      helpOrder,
    })

    return res.json(helpOrder)
  }
}

export default new AnswerController()
