import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Goal extends Model {}

Goal.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    targetHours: { type: DataTypes.FLOAT, allowNull: false },
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    endDate: { type: DataTypes.DATEONLY, allowNull: false },
    progressHours: { type: DataTypes.FLOAT, defaultValue: 0 }
  },
  { sequelize, modelName: 'goal' }
);

export default Goal;
