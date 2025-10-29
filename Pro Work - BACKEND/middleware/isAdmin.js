export default function isAdmin(req, res, next) {
  try {
    const key = req.headers['x-admin-key'];
    if (!key || key !== process.env.ADMIN_KEY) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
    return next();
  } catch (err) {
    console.error('isAdmin error', err.stack || err);
    return res.status(500).send({ message: 'Admin middleware error', error: err.message });
  }
}
