const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CmsPage = sequelize.define('CmsPage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  slug: { type: DataTypes.STRING, unique: true, allowNull: false }, // about-us, privacy-policy, terms, faq...
  title: { type: DataTypes.STRING, allowNull: false },
  content: DataTypes.TEXT,
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'cms_pages', timestamps: true });

module.exports = CmsPage;
