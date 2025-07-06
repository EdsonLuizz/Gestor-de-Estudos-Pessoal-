import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Plan extends Model {}

Plan.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: false }
  },
  { sequelize, modelName: 'plan' }
);

export default Plan;
