const ClassSlot = require('../models/classSlotModel');

// --- ROTAS PÚBLICAS ---

// @desc    Buscar todas as aulas futuras
// @route   GET /api/class-slots
// @access  Public
const getClassSlots = async (req, res) => {
  try {
    // Só mostra aulas que ainda não aconteceram
    const slots = await ClassSlot.find({
      dateTime: { $gte: new Date() },
    }).sort({ dateTime: 1 }); // Ordena pelas mais próximas

    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar horários de aulas.' });
  }
};

// @desc    Buscar uma única aula pelo ID
// @route   GET /api/class-slots/:id
// @access  Public
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

// --- ROTAS DE ADMIN ---

// @desc    Criar um novo horário de aula
// @route   POST /api/class-slots
// @access  Private/Admin
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
      author: req.user._id, // Vem do middleware 'protect'
    });

    const createdSlot = await slot.save();
    res.status(201).json(createdSlot);
  } catch (error) {
    // Trata o erro de duplicidade (mesmo horário)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Erro: Você já cadastrou uma aula nesse exato horário.' });
    }
    res.status(500).json({ message: 'Erro ao criar horário de aula.' });
  }
};

// @desc    Atualizar um horário de aula
// @route   PUT /api/class-slots/:id
// @access  Private/Admin
const updateClassSlot = async (req, res) => {
  try {
    const { title, description, dateTime, durationMinutes, maxStudents, level } = req.body;
    const slot = await ClassSlot.findById(req.params.id);

    if (slot) {
      // Garante que só o admin que criou possa editar (boa prática)
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

// @desc    Deletar um horário de aula
// @route   DELETE /api/class-slots/:id
// @access  Private/Admin
const deleteClassSlot = async (req, res) => {
  try {
    const slot = await ClassSlot.findById(req.params.id);

    if (slot) {
      // Garante que só o admin que criou possa deletar
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