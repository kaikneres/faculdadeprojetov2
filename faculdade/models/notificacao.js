'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notificacao extends Model {
    static associate(models) {
      // define association here
    }
  }
  Notificacao.init({
    produtoNome: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Notificacao',
  });
  return Notificacao;
};
