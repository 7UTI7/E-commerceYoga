// @desc    Upload de imagem genérica
// @route   POST /api/upload
// @access  Private (Admin ou Aluno)
const uploadImage = (req, res) => {
  // Se o middleware do Multer funcionou, o arquivo estará em req.file
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhuma imagem enviada.' });
  }

  // Retorna a URL segura do Cloudinary
  res.status(200).json({
    message: 'Upload realizado com sucesso!',
    imageUrl: req.file.path // Essa é a URL que o frontend precisa!
  });
};

module.exports = { uploadImage };