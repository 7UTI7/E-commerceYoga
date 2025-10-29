const ClassSlot = require('../models/classSlotModel');

/**
 * Converte { weekday, time } para a PRÓXIMA data/hora naquela combinação.
 * weekday: 0=Dom,1=Seg,...,6=Sáb ; time: "HH:mm"
 */
function nextDateFromWeekdayTime(weekday, time) {
  const [hh, mm] = String(time || '').split(':').map((n) => parseInt(n, 10));
  if ([weekday, hh, mm].some((v) => Number.isNaN(v))) return null;

  const now = new Date();
  const base = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hh,
    mm,
    0,
    0
  );

  // diferença em dias até o próximo weekday
  let addDays = (weekday - base.getDay() + 7) % 7;
  if (addDays === 0 && base <= now) addDays = 7;
  base.setDate(base.getDate() + addDays);
  return base;
}

// ---------- ROTAS PÚBLICAS ----------

// GET /api/class-slots
const getClassSlots = async (req, res) => {
  try {
    const slots = await ClassSlot.find({
      dateTime: { $gte: new Date() },
    }).sort({ dateTime: 1 });
    return res.status(200).json(slots);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar aulas.' });
  }
};

// GET /api/class-slots/:id
const getClassSlotById = async (req, res) => {
  try {
    const slot = await ClassSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Horário de aula não encontrado.' });
    return res.status(200).json(slot);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar aula.' });
  }
};

// ---------- ROTAS ADMIN ----------

// POST /api/class-slots
const createClassSlot = async (req, res) => {
  try {
    const {
      title,
      description,
      dateTime,
      durationMinutes,
      maxStudents,
      // formato alternativo
      weekday,
      time,
      modality,
    } = req.body;

    // Montagem de dados normalizados
    let resolvedDate = dateTime ? new Date(dateTime) : null;
    if (!resolvedDate && (weekday !== undefined && time)) {
      resolvedDate = nextDateFromWeekdayTime(Number(weekday), String(time));
    }
    if (!resolvedDate || isNaN(resolvedDate.getTime())) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: { dateTime: 'Envie dateTime (ISO) ou weekday/time válidos.' },
      });
    }

    const normalized = {
      title: title && String(title).trim()
        ? String(title).trim()
        : modality
          ? `Aula ${modality}`
          : 'Aula',
      description: description && String(description).trim()
        ? String(description).trim()
        : modality
          ? `Aula de ${modality}`
          : 'Aula',
      dateTime: resolvedDate,
      durationMinutes: typeof durationMinutes === 'number' ? durationMinutes : undefined,
      maxStudents: typeof maxStudents === 'number' ? maxStudents : undefined,
      author: req.user?._id, // vem do middleware protect
    };

    // Validação manual rápida para mensagens 400 (em vez de 500 genérico)
    const missing = [];
    if (!normalized.title) missing.push('title');
    if (!normalized.description) missing.push('description');
    if (!normalized.dateTime) missing.push('dateTime');
    if (!normalized.author) missing.push('author (token inválido?)');

    if (missing.length) {
      return res.status(400).json({
        message: 'Campos obrigatórios ausentes.',
        errors: { missing },
      });
    }

    const created = await ClassSlot.create(normalized);
    return res.status(201).json(created);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        message: 'Erro: você já cadastrou uma aula nesse horário.',
        errors: { duplicate: ['dateTime', 'author'] },
      });
    }
    if (error?.name === 'ValidationError') {
      // Coleta mensagens do mongoose
      const errors = {};
      for (const [k, v] of Object.entries(error.errors || {})) {
        errors[k] = v.message || 'Inválido';
      }
      return res.status(400).json({ message: 'Validação falhou.', errors });
    }
    return res.status(500).json({ message: 'Erro ao criar horário de aula.' });
  }
};

// PUT /api/class-slots/:id
const updateClassSlot = async (req, res) => {
  try {
    const {
      title,
      description,
      dateTime,
      durationMinutes,
      maxStudents,
      // formato alternativo
      weekday,
      time,
    } = req.body;

    const slot = await ClassSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Horário de aula não encontrado.' });

    let resolvedDate = dateTime ? new Date(dateTime) : null;
    if (!resolvedDate && (weekday !== undefined && time)) {
      resolvedDate = nextDateFromWeekdayTime(Number(weekday), String(time));
    }

    if (title !== undefined) slot.title = String(title).trim();
    if (description !== undefined) slot.description = String(description).trim();
    if (resolvedDate) slot.dateTime = resolvedDate;
    if (durationMinutes !== undefined) slot.durationMinutes = durationMinutes;
    if (maxStudents !== undefined) slot.maxStudents = maxStudents;

    const updated = await slot.save();
    return res.status(200).json(updated);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        message: 'Erro: conflito de horário com outra aula.',
        errors: { duplicate: ['dateTime', 'author'] },
      });
    }
    if (error?.name === 'ValidationError') {
      const errors = {};
      for (const [k, v] of Object.entries(error.errors || {})) {
        errors[k] = v.message || 'Inválido';
      }
      return res.status(400).json({ message: 'Validação falhou.', errors });
    }
    return res.status(500).json({ message: 'Erro ao atualizar horário de aula.' });
  }
};

// DELETE /api/class-slots/:id
const deleteClassSlot = async (req, res) => {
  try {
    const slot = await ClassSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Horário de aula não encontrado.' });

    // (Opcional) Só o autor/admin que criou pode deletar
    if (slot.author?.toString && req.user?._id && slot.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Sem permissão para deletar este horário.' });
    }

    await slot.deleteOne();
    return res.status(200).json({ message: 'Horário de aula removido.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao deletar horário de aula.' });
  }
};

module.exports = {
  getClassSlots,
  getClassSlotById,
  createClassSlot,
  updateClassSlot,
  deleteClassSlot,
};
