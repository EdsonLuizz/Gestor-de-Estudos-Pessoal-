import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Session extends Model {}

Session.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false },
    comments: { type: DataTypes.TEXT }
  },
  { sequelize, modelName: 'session' }
);

export default Session;
