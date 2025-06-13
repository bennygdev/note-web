module.exports = (sequelize, DataTypes) => {
  const Note = sequelize.define(
    'Note',
    {
      note_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image_url: {
        type: DataTypes.STRING(2048),
        allowNull: true,
      },
    },
    {
      tableName: 'notes',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Note;
};