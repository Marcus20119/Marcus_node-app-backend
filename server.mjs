import express from 'express';
import http from 'http';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import cors from 'cors';
import fakeData from './fakeData/index.js';

const app = express();
const httpServer = http.createServer(app);

const typeDefs = `#graphql
  type Author {
    id: String,
    name: String,
  }
  type Folder {
    id: String,
    name: String,
    createdAt: String,
    author: Author
  }

  type Query {
    folders: [Folder]
  }
`;
const resolvers = {
  Query: {
    folders: () => fakeData.folders,
  },
  Folder: {
    author: (parent, args, context, info) => {
      // parent: node cha, ở đây chính là folder
      // args: Dữ liệu mà phía client gửi lên server
      return fakeData.authors.find(author => author.id === parent.authorId);
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Muốn sử dụng await ở nhánh root thì cần đổi tên file thành đuôi .mjs
await server.start();
/**
 * Các Middleware được sử dụng:
 * - cors(): tránh bắn ra lỗi cors khi chạy - Lỗi chỉ được call api cùng tên miền
 * - bodyParser.json(): sử dụng để xử lý các yêu cầu HTTP đến từ client (như POST hoặc PUT requests) với JSON data được gửi lên.
 * - bodyParser.urlencoded({ extended: true }): sử dụng middleware này để có thể dùng được biến body trong phương thức POST
 */
app.use(
  cors(),
  bodyParser.json(),
  bodyParser.urlencoded({ extended: true }),
  expressMiddleware(server)
);

await new Promise(resolve => httpServer.listen({ port: 4000 }, resolve));
console.log('❤ Server ready at http://localhost:4000');
