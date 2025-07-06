import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Parameter extends Model {}

Parameter.init(
  {
    key: { type: DataTypes.STRING, primaryKey: true },
    value: { type: DataTypes.STRING, allowNull: false }
  },
  { sequelize, modelName: 'parameter' }
);

export default Parameter;
