require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../models'); // Importa os modelos do banco
const nodemailer = require('nodemailer');

// CONFIGURAÇÃO DO NODEMAILER (Para enviar e-mails reais)
// Você pode configurar estas variáveis no seu arquivo .env ou editar diretamente aqui
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true para 465 (SSL), false para outras (TLS)
  auth: {
    user: process.env.SMTP_USER || "seu-email@gmail.com", // Seu e-mail do Gmail ou provedor
    pass: process.env.SMTP_PASS || "sua-senha-de-app-aqui" // Sua Senha de App gerada no Google
  }
});

// Função para enviar o e-mail real formatado em HTML
async function enviarEmailDeNotificacao(nome, email, produtoNome) {
  const mailOptions = {
    from: `"Bar e Mercearia Silva" <${process.env.SMTP_USER}>`, // Remetente real (usa o e-mail configurado no .env)
    to: email, // Destinatário (e-mail do cliente)
    subject: `🎉 Novidade! O produto "${produtoNome}" voltou ao estoque!`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 25px; background-color: #FAF6F0; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #C3521F; margin-top: 0;">Olá, ${nome}!</h2>
        <p style="font-size: 16px; line-height: 1.6;">Você nos pediu para avisar e o estoque foi reabastecido! 😃</p>
        <p style="font-size: 16px; line-height: 1.6;">O produto <strong>"${produtoNome}"</strong> acaba de voltar ao estoque do <strong>Bar e Mercearia Silva</strong>.</p>
        <p style="font-size: 16px; line-height: 1.6;">Aproveite para garantir o seu clicando no botão abaixo:</p>
        <br>
        <div style="text-align: center;">
          <a href="http://localhost:3000" style="background-color: #C3521F; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Ir para a Mercearia</a>
        </div>
        <br>
        <hr style="border: none; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 11px; color: #777; text-align: center;">Esta é uma notificação automática solicitada por você no nosso site.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
}


/* Página inicial (Login) */
router.get('/', function (req, res, next) {
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
router.get('/cadastro', function (req, res, next) {
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
    status: 'Esgotado'
  },
  {
    nome: 'Cerveja Heineken Long Neck 330ml',
    imagem: '/imagens/heineken.jpg',
    categoria: 'CERVEJAS',
    precoFormatado: 'R$ 8,50',
    status: 'Disponível'
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
    status: 'Esgotado'
  }
];

/* Página Principal (Dashboard / Home) */
router.get('/home', async function (req, res, next) {
  const usuario_nome = req.cookies.usuario_nome || null;
  const sucesso_mensagem = req.query.sucesso || null;

  try {
    // Busca nomes dos produtos que estão como Disponível na lista estática
    const produtosDisponiveisNomes = produtosLista
      .filter(p => p.status === 'Disponível')
      .map(p => p.nome);

    let emailsEnviados = [];
    if (produtosDisponiveisNomes.length > 0) {
      // Busca notificações pendentes no banco de dados para esses produtos
      const notificacoes = await db.Notificacao.findAll({
        where: {
          produtoNome: {
            [db.Sequelize.Op.in]: produtosDisponiveisNomes
          }
        }
      });

      if (notificacoes.length > 0) {
        // Envia os e-mails reais de notificação com Nodemailer
        for (const n of notificacoes) {
          const clienteNome = n.nome || "Cliente";
          try {
            // Dispara o e-mail real
            await enviarEmailDeNotificacao(clienteNome, n.email, n.produtoNome);
            console.log(`\n\x1b[32m[EMAIL SUCCESS]\x1b[0m 📧 E-mail real enviado com sucesso para ${n.email} (${clienteNome})!`);
          } catch (mailError) {
            // Se falhar (ex: SMTP não configurado), loga o aviso e continua funcionando
            console.warn(`\n\x1b[33m[EMAIL REAL FALLBACK]\x1b[0m Não foi possível enviar o e-mail real para ${n.email} (${clienteNome}). SMTP não configurado. Erro:`, mailError.message);
          }

          // Registra para exibir na tela do simulador
          emailsEnviados.push({
            nome: clienteNome,
            email: n.email,
            produtoNome: n.produtoNome
          });
        }

        // Remove as notificações enviadas do banco
        await db.Notificacao.destroy({
          where: {
            id: {
              [db.Sequelize.Op.in]: notificacoes.map(n => n.id)
            }
          }
        });
      }
    }

    res.render('home', {
      title: 'Dashboard - Bar e Mercearia Silva',
      usuario_nome: usuario_nome,
      produtos: produtosLista,
      sucesso_mensagem: sucesso_mensagem,
      emailsEnviados: emailsEnviados
    });
  } catch (error) {
    console.error("Erro ao verificar notificações de e-mail:", error);
    res.render('home', {
      title: 'Dashboard - Bar e Mercearia Silva',
      usuario_nome: usuario_nome,
      produtos: produtosLista,
      sucesso_mensagem: sucesso_mensagem,
      emailsEnviados: []
    });
  }
});

/* Rota para Cadastrar Notificação de Produto Esgotado */
router.post('/avisar-me', async (req, res) => {
  const { produtoNome, nome, email } = req.body;
  try {
    // Salva a solicitação no banco de dados usando o modelo Notificacao
    await db.Notificacao.create({
      produtoNome: produtoNome,
      nome: nome,
      email: email
    });

    // Redireciona com mensagem de sucesso
    const msg = `Sucesso! Cadastramos o interesse de "${nome}" (${email}) no produto "${produtoNome}".`;
    res.redirect('/home?sucesso=' + encodeURIComponent(msg));
  } catch (error) {
    res.status(500).send("Erro ao registrar interesse no produto: " + error.message);
  }
});

/* Rota para Deslogar (Logout) */
router.get('/logout', function (req, res) {
  res.clearCookie('usuario_nome');
  res.redirect('/');
});

module.exports = router;