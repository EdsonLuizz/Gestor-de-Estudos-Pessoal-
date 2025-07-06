import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Subject extends Model {}

Subject.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT }
  },
  { sequelize, modelName: 'subject' }
);

export default Subject;
