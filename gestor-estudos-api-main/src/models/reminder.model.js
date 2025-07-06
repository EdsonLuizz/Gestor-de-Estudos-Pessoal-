import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Reminder extends Model {}

Reminder.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    datetime: { type: DataTypes.DATE, allowNull: false },
    recurrence: { type: DataTypes.ENUM('ONCE', 'DAILY', 'WEEKLY', 'MONTHLY'), defaultValue: 'ONCE' }
  },
  { sequelize, modelName: 'reminder' }
);

export default Reminder;
