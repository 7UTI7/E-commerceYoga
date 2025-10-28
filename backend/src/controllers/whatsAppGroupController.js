const WhatsAppGroup = require('../models/whatsAppGroupModel');

// --- ROTA DE USUÁRIO LOGADO (Student ou Admin) ---

// @desc    Buscar todos os grupos de WhatsApp
// @route   GET /api/whatsapp-groups
// @access  Private (Qualquer usuário logado)
const getGroups = async (req, res) => {
  try {
    const groups = await WhatsAppGroup.find({}).sort({ name: 1 }); // Ordena por nome
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar grupos.' });
  }
};

// --- ROTAS DE ADMIN ---

// @desc    Buscar um único grupo (para o admin editar)
// @route   GET /api/whatsapp-groups/:id
// @access  Private/Admin
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

// @desc    Criar um novo grupo
// @route   POST /api/whatsapp-groups
// @access  Private/Admin
const createGroup = async (req, res) => {
  try {
    const { name, description, joinLink } = req.body;

    const group = new WhatsAppGroup({
      name,
      description,
      joinLink,
      author: req.user._id, // Vem do middleware 'protect'
    });

    const createdGroup = await group.save();
    res.status(201).json(createdGroup);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar grupo.' });
  }
};

// @desc    Atualizar um grupo
// @route   PUT /api/whatsapp-groups/:id
// @access  Private/Admin
const updateGroup = async (req, res) => {
  try {
    const { name, description, joinLink } = req.body;
    const group = await WhatsAppGroup.findById(req.params.id);

    if (group) {
      // Garante que só o admin que criou possa editar
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

// @desc    Deletar um grupo
// @route   DELETE /api/whatsapp-groups/:id
// @access  Private/Admin
const deleteGroup = async (req, res) => {
  try {
    const group = await WhatsAppGroup.findById(req.params.id);

    if (group) {
      // Garante que só o admin que criou possa deletar
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