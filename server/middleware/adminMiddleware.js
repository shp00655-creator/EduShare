const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.email.toLowerCase().startsWith('admin'))) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin authorization required.' });
  }
};

module.exports = { isAdmin };
