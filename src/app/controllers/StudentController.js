import * as Yup from 'yup'
import { Op } from 'sequelize'

import Student from '../models/Student'

class StudentController {
  async index(req, res) {
    const { page = 1, name = '' } = req.query

    const students = await Student.findAll({
      where: {
        user_id: req.userId,
        active: true,
        name: { [Op.iLike]: `%${name}%` },
      },
      order: ['name'],
      attributes: [
        'id',
        'name',
        'email',
        'birthday',
        'age',
        'height',
        'weight',
      ],
      limit: 10,
      offset: (page - 1) * 10,
    })

    return res.json(students)
  }

  async show(req, res) {
    const student = await Student.findByPk(req.params.id, {
      attributes: [
        'id',
        'name',
        'email',
        'birthday',
        'age',
        'height',
        'weight',
        'active',
      ],
    })

    if (!student || !student.active) {
      return res.status(400).json({ error: "Student doesn't exists." })
    }

    return res.json(student)
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      birthday: Yup.date().required(),
      height: Yup.number()
        .min(0)
        .max(3),
      weight: Yup.number()
        .min(0)
        .max(999.99),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' })
    }

    const studentExists = await Student.findOne({
      where: { email: req.body.email, user_id: req.userId },
    })

    if (studentExists) {
      return res.status(400).json({ error: 'Student already exists.' })
    }

    const {
      id,
      name,
      email,
      birthday,
      height,
      weight,
      age,
    } = await Student.create({
      ...req.body,
      user_id: req.userId,
    })

    return res.json({
      id,
      name,
      email,
      birthday,
      height,
      weight,
      age,
    })
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      height: Yup.number()
        .min(0)
        .max(3),
      weight: Yup.number()
        .min(0)
        .max(999.99),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' })
    }

    const student = await Student.findOne({
      where: { id: req.params.id, user_id: req.userId },
    })

    if (req.body.email && req.body.email !== student.email) {
      const userExists = await Student.findOne({
        where: { email: req.body.email, user_id: req.userId },
      })

      if (userExists) {
        return res.status(400).json({ error: 'User already exists.' })
      }
    }

    const {
      id,
      name,
      email,
      birthday,
      height,
      weight,
      age,
    } = await student.update(req.body, {
      fields: ['name', 'email', 'birthday', 'height', 'weight', 'age'],
    })

    return res.json({
      id,
      name,
      email,
      birthday,
      height,
      weight,
      age,
    })
  }

  async delete(req, res) {
    const student = await Student.findByPk(req.params.id)

    if (!student) {
      return res.status(400).json({ error: "Student doesn't exists." })
    }

    if (student.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: "You don't have permission to do this." })
    }

    await student.update({ active: false })

    return res.json(student)
  }
}

export default new StudentController()
