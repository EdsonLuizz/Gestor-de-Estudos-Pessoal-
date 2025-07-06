import sequelize from '../config/database.js';
import User from './user.model.js';
import Plan from './plan.model.js';
import Subject from './subject.model.js';
import Topic from './topic.model.js';
import Session from './session.model.js';
import Goal from './goal.model.js';
import Reminder from './reminder.model.js';
import Parameter from './parameter.model.js';

// Associations
User.hasMany(Plan, { foreignKey: 'userId', onDelete: 'CASCADE' });
Plan.belongsTo(User, { foreignKey: 'userId' });

Plan.hasMany(Subject, { foreignKey: 'planId', onDelete: 'CASCADE' });
Subject.belongsTo(Plan, { foreignKey: 'planId' });

Subject.hasMany(Topic, { foreignKey: 'subjectId', onDelete: 'CASCADE' });
Topic.belongsTo(Subject, { foreignKey: 'subjectId' });

User.hasMany(Session, { foreignKey: 'userId', onDelete: 'CASCADE' });
Session.belongsTo(User, { foreignKey: 'userId' });
Plan.hasMany(Session, { foreignKey: 'planId', onDelete: 'SET NULL' });
Subject.hasMany(Session, { foreignKey: 'subjectId', onDelete: 'SET NULL' });
Topic.hasMany(Session, { foreignKey: 'topicId', onDelete: 'SET NULL' });

User.hasMany(Goal, { foreignKey: 'userId', onDelete: 'CASCADE' });
Goal.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Reminder, { foreignKey: 'userId', onDelete: 'CASCADE' });
Reminder.belongsTo(User, { foreignKey: 'userId' });

export { sequelize, User, Plan, Subject, Topic, Session, Goal, Reminder, Parameter };
