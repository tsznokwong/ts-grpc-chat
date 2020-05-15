import * as grpc from "grpc";
import { ChatService } from "./proto/service_grpc_pb";
import { ChatMessage } from "./proto/service_pb";

var users: grpc.ServerDuplexStream<ChatMessage, ChatMessage>[] = [];

const notifyChat = (message: ChatMessage) => {
  users.forEach((user) => {
    user.write(message);
  });
};

const ChatHandler = {
  join: (call: grpc.ServerDuplexStream<ChatMessage, ChatMessage>) => {
    users.push(call);
    const message = new ChatMessage();
    message.setUser("Server");
    message.setText("new user joined");
    notifyChat(message);
  },
  send: (
    call: grpc.ServerUnaryCall<ChatMessage>,
    callback: grpc.ServerUnaryCall<ChatMessage>
  ) => {
    notifyChat(call.request);
  },
};

function main() {
  const server = new grpc.Server();
  server.addService(ChatService, ChatHandler);
  const bindto = `0.0.0.0:50051`;
  server.bind(bindto, grpc.ServerCredentials.createInsecure());
  console.log(`STARTING SERVER ON ${bindto}`);
  server.start();
}

main();
