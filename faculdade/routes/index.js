const express = require('express');
const router = express.Router();
const db = require('../models'); // Importa os modelos do banco

/* Página inicial (Login) */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Login' });
});

/* ROTA DE TESTE: Criar um usuário manualmente para testar */
router.get('/criar-teste', async (req, res) => {
  try {
    const usuario = await db.Usuario.create({
      nome: 'Kaik',
      email: 'kaik@teste.com',
      senha: '123',
      telefone: '1199999999'
    });
    res.json({ mensagem: "Usuário de teste criado!", usuario });
  } catch (error) {
    res.status(500).send("Erro: " + error.message);
  }
});

/* Processar o Login */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await db.Usuario.findOne({ where: { email: email } });
    if (!usuario) {
      return res.render('index', { title: 'Login', erro: 'E-mail não cadastrado!' });
    }
    if (usuario.senha === password) {
      // Grava o nome do usuário em um cookie que dura 24 horas
      res.cookie('usuario_nome', usuario.nome, { maxAge: 24 * 60 * 60 * 1000 });
      // Redireciona para o dashboard (Home) após login bem sucedido
      res.redirect('/home');
    } else {
      return res.render('index', { title: 'Login', erro: 'Senha incorreta!' });
    }
  } catch (error) {
    return res.render('index', { title: 'Login', erro: 'Erro ao tentar logar: ' + error.message });
  }
});

/* Página de Cadastro */
router.get('/cadastro', function(req, res, next) {
  res.render('cadastro', { title: 'Cadastro' });
});

/* Processar o Cadastro */
router.post('/cadastro', async (req, res) => {
  const { nome, email, telefone, password } = req.body;
  try {
    // Verifica se já existe usuário com esse email
    const usuarioExistente = await db.Usuario.findOne({ where: { email: email } });
    if (usuarioExistente) {
      return res.render('cadastro', { title: 'Cadastro', erro: 'Este e-mail já está cadastrado!' });
    }

    // Cria o novo usuário
    const novoUsuario = await db.Usuario.create({
      nome: nome,
      email: email,
      senha: password,
      telefone: telefone
    });

    // Após o cadastro, redireciona para o login (ou poderia ser /home)
    res.redirect('/');
  } catch (error) {
    res.render('cadastro', { title: 'Cadastro', erro: 'Erro ao tentar cadastrar: ' + error.message });
  }
});

const produtosLista = [
  {
    nome: 'Cerveja Skol Pilsen 350ml',
    imagem: '/imagens/imagem-cerveja-skol.jpg',
    categoria: 'CERVEJAS',
    precoFormatado: 'R$ 4,50',
    status: 'Disponível'
  },
  {
    nome: 'Cerveja Brahma Chopp 350ml',
    imagem: '/imagens/cerveja-brahma.jpg',
    categoria: 'CERVEJAS',
    precoFormatado: 'R$ 4,80',
    status: 'Disponível'
  },
  {
    nome: 'Cerveja Antarctica Pilsen 350ml',
    imagem: '/imagens/antartica-cerveja1.jpg',
    categoria: 'CERVEJAS',
    precoFormatado: 'R$ 4,50',
    status: 'Disponível'
  },
  {
    nome: 'Cerveja Heineken Long Neck 330ml',
    imagem: '/imagens/heineken.jpg',
    categoria: 'CERVEJAS',
    precoFormatado: 'R$ 8,50',
    status: 'Esgotado'
  },
  {
    nome: 'Cerveja Skol Lata 269ml',
    imagem: '/imagens/skoll-duzentos-e-sessenta-e-nove.png',
    categoria: 'CERVEJAS',
    precoFormatado: 'R$ 3,20',
    status: 'Disponível'
  },
  {
    nome: 'Coca-Cola Original 1L',
    imagem: '/imagens/coca-cola-umlitro.png',
    categoria: 'REFRIGERANTES',
    precoFormatado: 'R$ 6,50',
    status: 'Disponível'
  },
  {
    nome: 'Coca-Cola Original Lata 350ml',
    imagem: '/imagens/coca-cola.png',
    categoria: 'REFRIGERANTES',
    precoFormatado: 'R$ 4,00',
    status: 'Disponível'
  },
  {
    nome: 'Fanta Laranja Lata 350ml',
    imagem: '/imagens/fanta.png',
    categoria: 'REFRIGERANTES',
    precoFormatado: 'R$ 3,80',
    status: 'Disponível'
  },
  {
    nome: 'Água Mineral Crystal Sem Gás 500ml',
    imagem: '/imagens/agua-cristal-quinhetasml.jpg',
    categoria: 'ÁGUAS',
    precoFormatado: 'R$ 3,00',
    status: 'Disponível'
  },
  {
    nome: 'Água Mineral Crystal Com Gás 500ml',
    imagem: '/imagens/imagem-agua-cristal-com-gas.png',
    categoria: 'ÁGUAS',
    precoFormatado: 'R$ 3,50',
    status: 'Disponível'
  },
  {
    nome: 'Gatorade Limão 500ml',
    imagem: '/imagens/gatorade-limao.png',
    categoria: 'ISOTÔNICOS',
    precoFormatado: 'R$ 6,00',
    status: 'Disponível'
  },
  {
    nome: 'Gatorade Frutas Cítricas 500ml',
    imagem: '/imagens/gatorade.jpg',
    categoria: 'ISOTÔNICOS',
    precoFormatado: 'R$ 6,00',
    status: 'Esgotado'
  },
  {
    nome: 'Monster Energy Drink 473ml',
    imagem: '/imagens/imagem-energetico-monster.jpg',
    categoria: 'ENERGÉTICOS',
    precoFormatado: 'R$ 10,99',
    status: 'Disponível'
  },
  {
    nome: 'Macarrão Galo Espaguete 500g',
    imagem: '/imagens/macarrao-galo.jpg',
    categoria: 'MERCEARIA',
    precoFormatado: 'R$ 5,50',
    status: 'Disponível'
  },
  {
    nome: 'Nissin Miojo Lámen Galinha Caipira',
    imagem: '/imagens/miojo.jpeg',
    categoria: 'MERCEARIA',
    precoFormatado: 'R$ 2,50',
    status: 'Disponível'
  },
  {
    nome: 'Achocolatado Nescau 400g',
    imagem: '/imagens/nescau-imagem.jpg',
    categoria: 'MERCEARIA',
    precoFormatado: 'R$ 9,80',
    status: 'Disponível'
  },
  {
    nome: 'Detergente Ypê Neutro 500ml',
    imagem: '/imagens/detergente-ype.jpeg',
    categoria: 'LIMPEZA',
    precoFormatado: 'R$ 2,20',
    status: 'Disponível'
  }
];

/* Página Principal (Dashboard / Home) */
router.get('/home', function(req, res, next) {
  const usuario_nome = req.cookies.usuario_nome || null;
  const sucesso_mensagem = req.query.sucesso || null;
  res.render('home', { 
    title: 'Dashboard - Bar e Mercearia Silva', 
    usuario_nome: usuario_nome,
    produtos: produtosLista,
    sucesso_mensagem: sucesso_mensagem
  });
});

/* Rota para Cadastrar Notificação de Produto Esgotado */
router.post('/avisar-me', async (req, res) => {
  const { produtoNome, email } = req.body;
  try {
    // Salva a solicitação no banco de dados usando o modelo Notificacao
    await db.Notificacao.create({
      produtoNome: produtoNome,
      email: email
    });
    
    // Redireciona com mensagem de sucesso
    const msg = `Sucesso! Cadastramos o e-mail "${email}" para receber uma notificação assim que o produto "${produtoNome}" estiver de volta no estoque.`;
    res.redirect('/home?sucesso=' + encodeURIComponent(msg));
  } catch (error) {
    res.status(500).send("Erro ao registrar interesse no produto: " + error.message);
  }
});

/* Rota para Deslogar (Logout) */
router.get('/logout', function(req, res) {
  res.clearCookie('usuario_nome');
  res.redirect('/');
});

module.exports = router;