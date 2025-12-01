const uploadImage = (req, res) => {
  
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhuma imagem enviada.' });
  }

  
  res.status(200).json({
    message: 'Upload realizado com sucesso!',
    imageUrl: req.file.path 
  });
};

module.exports = { uploadImage };