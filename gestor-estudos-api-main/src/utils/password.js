import bcrypt from 'bcrypt';
export async function hash(pwd) { return bcrypt.hash(pwd, 10); }
export async function compare(pwd, hash) { return bcrypt.compare(pwd, hash); }
