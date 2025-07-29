
# 🏁 Assetto Corsa: GT Edition

Um tributo moderno ao lendário **modo carreira de Gran Turismo 1**, totalmente integrado ao simulador **Assetto Corsa**. Esta versão especial transforma o AC em uma experiência single-player profunda, com economia, licenças, garagem, concessionárias e eventos especiais — como se fosse um jogo à parte.

<img width="400" alt="Assetto Corsa: GT Edition" src="https://github.com/user-attachments/assets/a6fbba09-c9f3-4ed3-8f61-b1d0dd91b37d" />

---

## 🎯 Objetivo

O **GT Edition** oferece uma reinterpretação fiel do modo carreira clássico:

- Modo carreira completo com progressão de jogador
- Compra e venda de carros (novos e usados)
- Sistema de licenças e desafios técnicos
- Corridas por categorias e campeonatos
- Upgrades de peças e manutenção na oficina
- Testes de desempenho e eventos especiais
- Integração com mods da comunidade AC

---

## 🧱 Tecnologias Utilizadas

| Camada        | Tecnologia                         |
|---------------|-------------------------------------|
| Interface     | Electron + React (App Desktop)     |
| Backend       | Node.js ou Python (Flask/FastAPI)  |
| Banco de dados| SQLite                             |
| Game Target   | Assetto Corsa (Steam + Proton OK)  |
| Assets        | JSON para carros, eventos, economia|

---

## 📦 Como executar

1. Instale as dependências do launcher (Node.js):
   ```bash
   cd launcher && npm install
   ```
2. Em outro terminal, instale os requisitos do backend e inicie a API:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   
   pip install -r backend/requirements.txt
   uvicorn backend.fastapi_app:app --reload
   ```
3. Por fim, execute o launcher Electron:
   ```bash
   npm start
   ```

Isso abrirá uma janela 1280x720 com o menu inicial do **Assetto Corsa: GT Edition**.

## 📁 Estrutura do Projeto

```bash
ac-gt-edition/
├── launcher/             # App React/Electron
├── backend/              # API para lógica de carreira
├── assets/
│   ├── cars.json         # Dados dos carros
│   ├── events.json       # Corridas e campeonatos
│   └── logo.png          # Logotipo do projeto
├── database/
│   └── savegame.sqlite   # Perfil do jogador e progresso
├── music/                # Trilha sonora de menus (royalty-free)
├── docs/                 # Mockups e imagens de referência
└── README.md
```

---

## 🚀 Funcionalidades

- [ ] Tela inicial com logo e tema musical
- [ ] Menu estilo mapa para navegar entre módulos
- [ ] Garagem com gerenciamento de carros
- [ ] Licenciamento por níveis (B, A, S)
- [ ] Corridas individuais e campeonatos temáticos
- [ ] Concessionárias rotativas
- [ ] Sistema de créditos e prêmios
- [ ] Oficina com upgrades de peças
- [ ] Integração com arquivos do Assetto Corsa
- [ ] Compatibilidade com mods de carros/pistas

---

## 🔊 Trilha Sonora

As músicas dos menus seguem o estilo jazz/lounge do GT1, porém são **livres de royalties** e disponíveis sob licenças permissivas.

Músicas obtidas de:
- [YouTube Audio Library](https://www.youtube.com/audiolibrary)
- [Pixabay Music](https://pixabay.com/music/)
- [Free Music Archive](https://freemusicarchive.org)

---

## 💡 Inspiração

Este projeto é um tributo ao legado do simracing e da era de ouro dos jogos de corrida:

- 🎮 *Gran Turismo 1* (PS1)
- 🏎️ *Assetto Corsa* e sua comunidade de mods

---

## 🛠️ Contribuindo

Quer ajudar a criar o modo carreira dos sonhos para simracers?

1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b feature/sua-feature`
3. Commit: `git commit -m 'Nova funcionalidade'`
4. Push: `git push origin feature/sua-feature`
5. Crie um Pull Request!

Sugestões e feedbacks também são bem-vindos via Issues.

---

## 📜 Licença

MIT License.  
Este projeto é feito por fãs e **não é afiliado à Kunos Simulazioni, Sony, Polyphony Digital ou PlayStation**.

---

## 👨‍💻 Autor

Desenvolvido com paixão por simracing por **[Ricardo Castro Martin]**  
📧 Contato: ricardo.cmartin@gmail.com  
📷 Instagram: [@ricardo.cmartin]  
🐱 GitHub: [github.com/ricardocmartin]
