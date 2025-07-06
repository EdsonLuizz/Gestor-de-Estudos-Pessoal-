import jwt from 'jsonwebtoken';

export default function auth(roles = []) {
  return (req, res, next) => {
    const token = (req.headers.authorization || '').split(' ')[1];
    if (!token) return res.status(401).json({ msg: 'Token não fornecido' });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ msg: 'Acesso negado' });
      }
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ msg: 'Token inválido' });
    }
  };
}
