// @ts-nocheck
import { belongsTo, createServer, Factory, hasMany, Model, RestSerializer } from 'miragejs'
import faker from 'faker'
import { orderBy, isNull, sample, sampleSize } from 'lodash-es'

const authUser = {
  email: 'test@test.com',
  username: 'test-user-1',
}

function makeServer({ environment = 'development' } = {}) {
  return createServer({
    environment,

    serializers: {
      application: RestSerializer,
      article: RestSerializer.extend({
        include: ['author', 'favorite'],
        embed: true,
        serialize(_, request) {
          const { limit, offset } = request.queryParams
          const start = Number(offset) * Number(limit)
          const end = start + Number(limit)

          // eslint-disable-next-line prefer-rest-params
          const json = RestSerializer.prototype.serialize.apply(this, arguments)

          const computedArticle = (article) => {
            const favorites = this.schema.favorites.where({ articleId: article.id })
            const favorited = this.schema.favorites.findBy({ articleId: article.id, userId: '11' })
            return { ...article, favoritesCount: favorites.length, favorited: !isNull(favorited) }
          }

          if ('articles' in json) {
            const { articles } = json
            json.articles = orderBy(
              articles.map(computedArticle).slice(start, end),
              (article) => new Date(article.createdAt).getTime(),
              'desc'
            )
            json.articlesCount = articles.length
          } else {
            const { article } = json
            json.article = computedArticle(article)
          }

          return json
        },
      }),
      comment: RestSerializer.extend({
        include: ['author'],
        embed: true,
      }),
    },

    models: {
      user: Model.extend({
        articles: hasMany(),
        favorites: hasMany(),
        comments: hasMany(),
      }),
      article: Model.extend({
        author: belongsTo('user'),
        favorite: belongsTo(),
        comments: hasMany(),
      }),
      tag: Model,
      favorite: Model.extend({
        user: belongsTo(),
        article: belongsTo(),
      }),
      comment: Model.extend({
        article: belongsTo(),
        author: belongsTo('user'),
      }),
    },

    factories: {
      article: Factory.extend({
        slug: () => faker.datatype.uuid(),
        title: () => faker.lorem.sentence(),
        description: () => faker.lorem.sentence(),
        body: () => faker.lorem.paragraph(),
        createdAt: () => faker.date.past(),
        updatedAt: () => faker.date.past(),
        favorited: false,
        favoritesCount: 0,
        afterCreate(article, server) {
          const tags = server.db.tags.map(({ text }) => text)

          article.update({
            tagList: tags.sort(() => Math.random() - Math.random()).slice(0, faker.datatype.number(tags.length / 2)),
          })
        },
      }),
      comment: Factory.extend({
        createdAt: () => faker.date.past(),
        updatedAt: () => faker.date.past(),
        body: () => faker.lorem.paragraph(),
      }),
      user: Factory.extend({
        email: () => faker.internet.email(),
        token: () => faker.datatype.uuid(),
        username: () => faker.internet.userName(),
        bio: () => faker.lorem.sentence(),
        image: () => faker.image.avatar(),
        following: false,
        afterCreate(user, server) {
          server.createList('article', 5, { author: user })
        },
      }),
      tag: Factory.extend({
        text: () => faker.lorem.word(),
      }),
    },

    seeds(server) {
      const db = window.localStorage.getItem('mirage-persistance')

      if (db) {
        server.db.loadData(JSON.parse(db))
      } else {
        server.createList('tag', 10)
        const users = server.createList('user', 10)
        const user = server.create('user', authUser)
        sampleSize(users, 3).forEach((user) => {
          user.update({ following: true })
        })
        const allUsers = [...users, user]

        const articles = server.schema.articles.all()

        allUsers.forEach((user) => {
          server.createList('favorite', 3, { user }).forEach((favorite) => {
            const article = sample(articles.filter(({ authorId }) => authorId !== user.id).models)
            favorite.update({ article })
          })
        })

        window.localStorage.setItem('mirage-persistance', JSON.stringify(server.db.dump()))
      }
    },

    routes() {
      this.get('/articles/feed', (schema) => schema.articles.all().filter((article) => article.author.following))

      this.get('/articles', (schema, request) => {
        const { tag, author, favorited } = request.queryParams

        const articles = schema.articles.all()

        if (tag) {
          return articles.filter(({ tagList }) => tagList.includes(tag))
        }

        if (author) {
          return articles.filter((article) => article.author?.username === author)
        }

        if (favorited) {
          const user = this.schema.users.findBy({ username: favorited })

          return schema.articles.all().filter((article) => user.favoriteIds.includes(article.favoriteId))
        }

        return articles
      })

      this.post('/articles', (schema, request) => {
        const { article } = JSON.parse(request.requestBody)

        const author = schema.users.findBy({ email: authUser.email })

        return schema.articles.create({ ...article, author })
      })

      this.get('/articles/:slug', (schema, request) => {
        const { slug } = request.params

        return schema.articles.findBy({ slug })
      })

      this.get('/articles/:slug/comments', (schema, request) => {
        const { slug } = request.params

        const article = schema.articles.findBy({ slug })

        return article.comments
      })

      this.post('/articles/:slug/comments', (schema, request) => {
        const { slug } = request.params

        const body = JSON.parse(request.requestBody)

        const author = schema.users.findBy({ email: authUser.email })

        const now = new Date().getTime()

        const article = schema.articles.findBy({ slug })

        return schema.comments.create({ ...body.comment, createdAt: now, updatedAt: now, author, article })
      })

      this.get('/tags', (schema) => ({
        tags: schema.db.tags.map(({ text }) => text),
      }))

      this.post('/users/login', (schema, request) => {
        const { user } = JSON.parse(request.requestBody)

        return schema.users.findBy({ email: user.email })
      })

      this.post('/users', (schema, request) => {
        const { user } = JSON.parse(request.requestBody)

        return schema.users.create(user)
      })

      this.put('/user', (schema, request) => {
        const { user } = JSON.parse(request.requestBody)

        return schema.users.findBy({ email: authUser.email }).update(user)
      })

      this.get('/user', (schema) => schema.users.findBy({ email: authUser.email }))

      this.get('/profiles/:username', (schema, request) => {
        const { username } = request.params

        return {
          profile: schema.users.findBy({ username }),
        }
      })

      this.post('/profiles/:username/follow', (schema, request) => {
        const { username } = request.params

        const user = schema.users.findBy({ username }).update({
          following: true,
        })

        return {
          profile: user,
        }
      })

      this.delete('/profiles/:username/follow', (schema, request) => {
        const { username } = request.params

        const user = schema.users.findBy({ username }).update({
          following: false,
        })

        return {
          profile: user,
        }
      })

      this.post('/articles/:slug/favorite', (schema, request) => {
        const { slug } = request.params
        const article = schema.articles.findBy({ slug })
        const user = schema.users.findBy({ email: authUser.email })
        schema.favorites.create({ article, user })

        return article
      })

      this.delete('/articles/:slug/favorite', (schema, request) => {
        const { slug } = request.params
        const article = schema.articles.findBy({ slug })
        const user = schema.users.findBy({ email: authUser.email })
        const favorite = schema.favorites.findBy({ articleId: article.id, userId: user.id })

        favorite.destroy()

        return article
      })

      this.passthrough('http://localhost:5000/**')
    },
  })
}

export default makeServer
