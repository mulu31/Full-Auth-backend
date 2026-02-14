import bcrypt from "bcryptjs";

export const hashPassword = async (plainPassword) => {
  const pepperedPassword = plainPassword + process.env.PASSWORD_PEPPER;
  return bcrypt.hash(pepperedPassword, 12);
};

export const comparePassword = async (plainPassword, hash) => {
  const pepperedPassword = plainPassword + process.env.PASSWORD_PEPPER;
  return bcrypt.compare(pepperedPassword, hash);
};
