SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS treino_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE treino_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS agendamentos;
DROP TABLE IF EXISTS servicos;
DROP TABLE IF EXISTS veiculos;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuarios (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    senha_hash  VARCHAR(255) NOT NULL,
    perfil      ENUM('admin','atendente') NOT NULL DEFAULT 'atendente',
    criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE clientes (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(120) NOT NULL,
    cpf         VARCHAR(14)  NOT NULL UNIQUE,
    telefone    VARCHAR(20),
    email       VARCHAR(150),
    endereco    VARCHAR(255),
    criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE veiculos (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    placa       VARCHAR(7)   NOT NULL UNIQUE,
    marca       VARCHAR(60)  NOT NULL,
    modelo      VARCHAR(60)  NOT NULL,
    ano         SMALLINT,
    cor         VARCHAR(30),
    cliente_id  INT UNSIGNED NOT NULL,
    CONSTRAINT chk_ano CHECK (ano IS NULL OR ano BETWEEN 1900 AND 2100),
    CONSTRAINT fk_veiculo_cliente FOREIGN KEY (cliente_id)
        REFERENCES clientes(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE servicos (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    descricao   VARCHAR(120) NOT NULL UNIQUE,
    valor       DECIMAL(10,2) NOT NULL,
    CONSTRAINT chk_valor CHECK (valor >= 0)
) ENGINE=InnoDB;

CREATE TABLE agendamentos (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    veiculo_id  INT UNSIGNED NOT NULL,
    servico_id  INT UNSIGNED NOT NULL,
    usuario_id  INT UNSIGNED NOT NULL,
    data_hora   DATETIME NOT NULL,
    status      ENUM('Agendado','Em andamento','Concluído','Cancelado') NOT NULL DEFAULT 'Agendado',
    observacoes VARCHAR(255),
    INDEX idx_agend_data (data_hora),
    CONSTRAINT fk_ag_veiculo FOREIGN KEY (veiculo_id) REFERENCES veiculos(id)  ON DELETE RESTRICT,
    CONSTRAINT fk_ag_servico FOREIGN KEY (servico_id) REFERENCES servicos(id)  ON DELETE RESTRICT,
    CONSTRAINT fk_ag_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)  ON DELETE RESTRICT
) ENGINE=InnoDB;

INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES
 ('Administrador',    'admin@treino.com',     '$2a$10$gsszKu5yonCmMkaA8eXJN.MK5g.n/sSkS1C5Uikw8O8qleag/ex4e', 'admin'),
 ('Atendente Padrão', 'atendente@treino.com', '$2a$10$Qh0kO7F/jZI.dJE99Km2iO/vgT3JoKrlF5hbrFVf63cTHYVjEuega', 'atendente');

INSERT INTO clientes (nome, cpf, telefone, email, endereco) VALUES
 ('Maria Silva',  '111.444.777-35', '(48) 99999-1111', 'maria@email.com', 'Rua das Flores, 100 - Palhoça/SC'),
 ('João Pereira', '529.982.247-25', '(48) 99999-2222', 'joao@email.com',  'Av. Central, 250 - Florianópolis/SC'),
 ('Ana Souza',    '935.411.347-80', '(48) 99999-3333', 'ana@email.com',   'Rua do Sol, 45 - São José/SC');

INSERT INTO veiculos (placa, marca, modelo, ano, cor, cliente_id) VALUES
 ('ABC1D23', 'Fiat',       'Argo',  2021, 'Branco', 1),
 ('DEF4G56', 'Volkswagen', 'Gol',   2018, 'Prata',  2),
 ('HIJ7K89', 'Chevrolet',  'Onix',  2022, 'Preto',  3),
 ('LMN0P12', 'Honda',      'Civic', 2020, 'Cinza',  1);

INSERT INTO servicos (descricao, valor) VALUES
 ('Troca de óleo', 150.00), ('Alinhamento e balanceamento', 120.00),
 ('Revisão completa', 480.00), ('Troca de pastilhas de freio', 260.00),
 ('Diagnóstico eletrônico', 90.00);

INSERT INTO agendamentos (veiculo_id, servico_id, usuario_id, data_hora, status, observacoes) VALUES
 (1, 1, 1, '2026-10-26 09:00:00', 'Agendado',     'Cliente pediu filtro novo'),
 (2, 3, 2, '2026-10-27 14:00:00', 'Agendado',     NULL),
 (3, 5, 2, '2026-10-20 10:30:00', 'Em andamento', 'Luz de injeção acesa'),
 (4, 2, 1, '2026-10-15 08:00:00', 'Concluído',    NULL);
