const Event = require('../models/eventModel');

// --- ROTAS PÚBLICAS ---

// @desc    Buscar todos os eventos futuros
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    // Filtra para mostrar apenas eventos cuja data
    // seja 'maior ou igual' ($gte) a data de HOJE.
    // Ordena pela data do evento (os mais próximos primeiro)
    const events = await Event.find({
      date: { $gte: new Date() },
    }).sort({ date: 1 }); // 1 = ordem ascendente

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar eventos.' });
  }
};

// @desc    Buscar um único evento pelo ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json({ message: 'Evento não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar evento.' });
  }
};

// --- ROTAS DE ADMIN ---

// @desc    Criar um novo evento
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;

    const event = new Event({
      title,
      description,
      date,
      location,
      author: req.user._id, // Vem do middleware 'protect'
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar evento.' });
  }
};

// @desc    Atualizar um evento
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    const event = await Event.findById(req.params.id);

    if (event) {
      event.title = title || event.title;
      event.description = description || event.description;
      event.date = date || event.date;
      event.location = location || event.location;

      const updatedEvent = await event.save();
      res.status(200).json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Evento não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar evento.' });
  }
};

// @desc    Deletar um evento
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      await event.deleteOne();
      res.status(200).json({ message: 'Evento deletado com sucesso.' });
    } else {
      res.status(404).json({ message: 'Evento não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar evento.' });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};