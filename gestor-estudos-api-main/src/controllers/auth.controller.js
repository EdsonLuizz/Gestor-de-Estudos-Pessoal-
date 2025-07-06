import jwt from 'jsonwebtoken';
import { hash, compare } from '../utils/password.js';
import { User } from '../models/index.js';

export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ msg: 'E-mail já cadastrado' });
    const passwordHash = await hash(password);
    const user = await User.create({ name, email, password: passwordHash, role });
    return res.status(201).json(user);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await compare(password, user.password))) {
      return res.status(401).json({ msg: 'Credenciais inválidas' });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}
