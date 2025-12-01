const ClassSlot = require('../models/classSlotModel');

const getClassSlots = async (req, res) => {
  try {
    const slots = await ClassSlot.find({
      dateTime: { $gte: new Date() },
    }).sort({ dateTime: 1 });

    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar horários de aulas.' });
  }
};

const getClassSlotById = async (req, res) => {
  try {
    const slot = await ClassSlot.findById(req.params.id);
    if (slot) {
      res.status(200).json(slot);
    } else {
      res.status(404).json({ message: 'Horário de aula não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar horário de aula.' });
  }
};

const createClassSlot = async (req, res) => {
  try {
    const { title, description, dateTime, durationMinutes, maxStudents, level } = req.body;

    const slot = new ClassSlot({
      title,
      description,
      dateTime,
      durationMinutes,
      maxStudents,
      level,
      author: req.user._id,
    });

    const createdSlot = await slot.save();
    res.status(201).json(createdSlot);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Erro: Você já cadastrou uma aula nesse exato horário.' });
    }
    res.status(500).json({ message: 'Erro ao criar horário de aula.' });
  }
};

const updateClassSlot = async (req, res) => {
  try {
    const { title, description, dateTime, durationMinutes, maxStudents, level } = req.body;
    const slot = await ClassSlot.findById(req.params.id);

    if (slot) {
      if (slot.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Não autorizado a editar este item.' });
      }
      
      slot.title = title || slot.title;
      slot.description = description || slot.description;
      slot.dateTime = dateTime || slot.dateTime;
      slot.durationMinutes = durationMinutes || slot.durationMinutes;
      slot.maxStudents = maxStudents || slot.maxStudents;
      slot.level = level || slot.level;

      const updatedSlot = await slot.save();
      res.status(200).json(updatedSlot);
    } else {
      res.status(404).json({ message: 'Horário de aula não encontrado.' });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Erro: Conflito de horário com outra aula.' });
    }
    res.status(500).json({ message: 'Erro ao atualizar horário de aula.' });
  }
};

const deleteClassSlot = async (req, res) => {
  try {
    const slot = await ClassSlot.findById(req.params.id);

    if (slot) {
      if (slot.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Não autorizado a deletar este item.' });
      }
      
      await slot.deleteOne();
      res.status(200).json({ message: 'Horário de aula deletado com sucesso.' });
    } else {
      res.status(404).json({ message: 'Horário de aula não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar horário de aula.' });
  }
};

module.exports = {
  getClassSlots,
  getClassSlotById,
  createClassSlot,
  updateClassSlot,
  deleteClassSlot,
};