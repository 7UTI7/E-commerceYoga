const WhatsAppGroup = require('../models/whatsAppGroupModel');

const getGroups = async (req, res) => {
  try {
    const groups = await WhatsAppGroup.find({}).sort({ name: 1 }); // Ordena por nome
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar grupos.' });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await WhatsAppGroup.findById(req.params.id);
    if (group) {
      res.status(200).json(group);
    } else {
      res.status(404).json({ message: 'Grupo não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar grupo.' });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name, description, joinLink } = req.body;

    const group = new WhatsAppGroup({
      name,
      description,
      joinLink,
      author: req.user._id, 
    });

    const createdGroup = await group.save();
    res.status(201).json(createdGroup);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar grupo.' });
  }
};

const updateGroup = async (req, res) => {
  try {
    const { name, description, joinLink } = req.body;
    const group = await WhatsAppGroup.findById(req.params.id);

    if (group) {
      
      if (group.author.toString() !== req.user._id.toString()) {
         return res.status(403).json({ message: 'Não autorizado a editar este item.' });
      }
      
      group.name = name || group.name;
      group.description = description || group.description;
      group.joinLink = joinLink || group.joinLink;

      const updatedGroup = await group.save();
      res.status(200).json(updatedGroup);
    } else {
      res.status(404).json({ message: 'Grupo não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar grupo.' });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await WhatsAppGroup.findById(req.params.id);

    if (group) {
      
      if (group.author.toString() !== req.user._id.toString()) {
         return res.status(403).json({ message: 'Não autorizado a deletar este item.' });
      }
      
      await group.deleteOne();
      res.status(200).json({ message: 'Grupo deletado com sucesso.' });
    } else {
      res.status(404).json({ message: 'Grupo não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar grupo.' });
  }
};

module.exports = {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
};