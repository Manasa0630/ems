function requireUser(req, res, next) {
  const actorType = req.header('x-actor-type');
  const actorId = req.header('x-actor-id');
  if (!actorType || !actorId) {
    return res.status(401).json({ error: 'Missing auth headers (x-actor-type, x-actor-id). Please log in.' });
  }
  req.actor = { type: actorType, id: Number(actorId) };
  next();
}

function requireAdmin(req, res, next) {
  requireUser(req, res, () => {
    if (req.actor.type !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

module.exports = { requireUser, requireAdmin };
