const express = require('express')
const expressGraphQL = require('express-graphql')
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt
} = require('graphql')

const app = express() 

const authors = [
    {id : 1, name: 'J.K. Rowling'},
    {id : 2, name: 'J.R.R Tolkien'},
    {id : 3, name: 'Stephen King'}

]

const books = [
    {id : 1, name: 'Harry Potter and the Chamber Of Secrets', authorId: 1},
    {id : 2, name: 'Harry Potter and the Philospher Stone', authorId: 1},
    {id : 3, name: 'The Fellowship of the Ring', authorId: 2},
    {id : 4, name: 'The Two Towers', authorId: 2},
    {id : 5, name: 'The Return of The King', authorId: 2},
    {id : 6, name: 'It', authorId: 3},
    {id : 7, name: 'Cujo', authorId: 3},
    {id : 8, name: 'Children of the corn', authorId: 3}

]

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book written by an author',
    fields: () => ({
      id: { type: GraphQLNonNull(GraphQLInt) },
      name: { type: GraphQLNonNull(GraphQLString) },
      authorId: { type: GraphQLNonNull(GraphQLInt) },
      author: {
        type: AuthorType,
        resolve: (book) => {
          return authors.find(author => author.id === book.authorId)
        }
      }
    })
  })

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'This represents a author of a book',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) => {
        return books.filter(book => book.authorId === author.id)
      }
    }
  })
})


const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book:{
            type: BookType,
            description: 'A Single Book',
            args:{
                id: {type : GraphQLInt}
            },
            resolve: (parent,args) => books.find(book => book.id == args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of all Books',
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of all Authors',
            resolve: () => authors
        },
        author: {
            type: AuthorType,
            description: 'A Single Author',
            args: {
                id: { type: GraphQLInt}
            },
            resolve: (parent,args) => authors.find(author => author.id = args.id)
        }
    })


})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'add book',
            args:{
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parents,args) => {
                const book = { id: books.length + 1, name: args.name, authorId: args.authorId}
                books.push(book)
                return book 
            }
        }, 
        addAuthor: {
            type: AuthorType,
            description: 'add author',
            args:{
                name: {type: GraphQLNonNull(GraphQLString)}
            },
            resolve: (parents,args) => {
                const author = { id: authors.length + 1, name: args.name}
                authors.push(author)
                return author
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})


app.use('/graphql', expressGraphQL({
    schema : schema, 
    graphiql: true

}))

app.listen(5000., ()=> console.log('Server running!'));

