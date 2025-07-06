import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Topic extends Model {}

Topic.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT }
  },
  { sequelize, modelName: 'topic' }
);

export default Topic;
