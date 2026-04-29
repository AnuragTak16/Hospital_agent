export const authMiddleware = (req, res, next) => {
  console.log('HEADERS:', req.headers);

  const role = req.headers['role'];

  if (!role) {
    console.log('No role found');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.user = { role };
  console.log('User set:', req.user);

  next();
};

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
