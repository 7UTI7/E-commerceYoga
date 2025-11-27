const Event = require('../models/eventModel');

// --- ROTAS PÚBLICAS ---

// @desc    Buscar todos os eventos futuros
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({
      date: { $gte: new Date() },
    }).sort({ date: 1 });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar eventos.' });
  }
};

// @desc    Buscar um único evento pelo ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('author', 'name avatar');
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
const createEvent = async (req, res) => {
  try {
    // 1. ADICIONADO coverImage
    const { title, description, date, location, coverImage } = req.body;

    const event = new Event({
      title,
      description,
      date,
      location,
      coverImage, // 2. ADICIONADO
      author: req.user._id, 
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar evento.' });
  }
};

// @desc    Atualizar um evento
const updateEvent = async (req, res) => {
  try {
    // 1. ADICIONADO coverImage
    const { title, description, date, location, coverImage } = req.body;
    const event = await Event.findById(req.params.id);

    if (event) {
      event.title = title || event.title;
      event.description = description || event.description;
      event.date = date || event.date;
      event.location = location || event.location;
      
      // 2. ADICIONADO
      if (coverImage) {
        event.coverImage = coverImage;
      }

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