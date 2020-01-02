import { Op } from 'sequelize'
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns'
import Checkin from '../models/Checkin'

class CheckinController {
  async store(req, res) {
    const today = new Date()

    const checkinExists = await Checkin.findOne({
      where: {
        student_id: req.userId,
        created_at: { [Op.between]: [startOfDay(today), endOfDay(today)] },
      },
    })

    if (checkinExists) {
      return res.status(400).json({ error: 'Checkin already exists.' })
    }

    const checkinsAmount = await Checkin.count({
      where: {
        created_at: { [Op.between]: [startOfWeek(today), endOfWeek(today)] },
      },
    })

    if (checkinsAmount >= 5) {
      return res.status(401).json({ error: 'Maximum allowed checkins reached' })
    }

    const counter =
      (await Checkin.count({ where: { student_id: req.userId } })) + 1

    const checkin = await Checkin.create({ student_id: req.userId, counter })

    return res.json(checkin)
  }

  async index(req, res) {
    const { page = 1 } = req.query

    const checkins = await Checkin.findAll({
      where: { student_id: req.userId },
      attributes: ['id', 'counter', 'created_at'],
      order: [['counter', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20,
    })

    return res.json(checkins)
  }
}

export default new CheckinController()
