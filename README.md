<h1 align="center">UniCaronas BackEnd
</h1>
<h3 align="center">
🚘 Conectamos caronas com canoneiros da UFG de forma eficiente 🚘
</h3>
<h4 align="center">
	Backend da aplicação UniCaronas</br>
	🚧 Em construção 🚧
</h4>

## Tabela de conteúdos

 * [Sobre o projeto](#-sobre-o-projeto)
 * [Funcionalidades](#-funcionalidades)
 * [Desenvolvimento](#-desenvolvimento)
 	* [Primeiros Passos](#primeiros-passos)
 	* [Rodando o Backend](#rodando-o-backend)
 * [Como contribuir](#-como-contribuir)

## 💻 Sobre o projeto

O UniCaronas é um aplicativo mobile que nasceu da ideia de resolver uma necessidade
comum no dia dia dos universitários: <strong>Encontrar caronas.</strong> O objetivo do app, portanto,
é conectar motoristas e passageiros universitários, de forma que os estudantes psosam solicitar ou oferecer caronas.

<strong>A construção deste Projeto está dividida em dois repositórios:</strong> </br>
* Mobile: https://github.com/CS2020-1-CavaloTroia/UniCaronasMobile</br>
* Backend: https://github.com/CS2020-1-CavaloTroia/UniCaronasBackend

Para acessar o repositório raiz acesse: https://github.com/CS2020-1-CavaloTroia/UniCaronas

>Projeto desenvolvido durante o curso de Construção de Software da Universidade Federal de Goiás.

## 📱 Funcionalidades

  - [x] Estudantes matrículados na UFG tem acesso ao aplicativo móvel, onde podem:
	- [x] solicitar caronas para um local desejado
	- [x] aceitar ou recusar caronas a outros estudantes, dado um local de saída e de chegada
	- [x] definir um valor específico para sua carona, quando oferecerem

## 🚀 Desenvolvimento

### Primeiros Passos

Para dar início ao desenvolvimento do Backend, certifique-se de instalar em sua máquina:
- [ ] Editor de código-fonte como [VSCode](https://code.visualstudio.com/).
- [ ] [Node.js](https://nodejs.org/en/) versão 14.15.4 LTS ou superior
- [ ] [Yarn](https://yarnpkg.com/) versão 1.22.4 ou superior
- [ ] Configurar um Banco de Dados no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/lp/try2?utm_source=google&utm_campaign=gs_americas_brazil_search_brand_atlas_desktop&utm_term=mongodb%20atlas&utm_medium=cpc_paid_search&utm_ad=e&utm_ad_campaign_id=1718986516&gclid=CjwKCAiAgJWABhArEiwAmNVTBzoPTpu7fZZ7PNThK8_W-Xb8NMybDiwXFMGgKaVU8Sa_eolHOEFKshoC-PoQAvD_BwE)

### Rodando o Backend

```bash
Clone este repositório
$ git clone https://github.com/CS2020-1-CavaloTroia/UniCaronasBackend

Acesse a pasta do projeto backend no seu terminal/cmd
$ cd UniCaronasBackend

Instale as dependências
$ npm install

Execute a aplicação
$ yarn start

A aplicação será aberta na porta:3333  - acesse http://localhost:3333
```

## 💡 Como contribuir

1. Faça um **fork** do projeto.
2. Crie uma nova branch com as suas alterações: `git checkout -b my-feature`
3. Salve as alterações e crie uma mensagem de commit contando o que você fez: `git commit -m "feature: My new feature"`
4. Envie as suas alterações: `git push origin my-feature`
