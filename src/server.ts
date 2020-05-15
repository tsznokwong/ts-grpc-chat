import * as grpc from "grpc";
import { ChatService } from "./proto/service_grpc_pb";
import { ChatMessage, JoinRequest } from "./proto/service_pb";

var users: grpc.ServerWritableStream<JoinRequest>[] = [];

const notifyChat = (message: ChatMessage) => {
  users.forEach((user) => {
    user.write(message);
  });
};

const removeUser = (username: string) => {
  const index = users.findIndex((user) => user.request.getUser() === username);
  if (index > -1) {
    users.splice(index, 1);
  }
};

const joinMessage = (username: string) => {
  const message = new ChatMessage();
  message.setUser("Server");
  message.setText(`${username} joined`);
  return message;
};

const leaveMessage = (username: string) => {
  const message = new ChatMessage();
  message.setUser("Server");
  message.setText(`${username} left`);
  return message;
};

const ChatHandler = {
  join: (call: grpc.ServerWritableStream<JoinRequest>) => {
    users.forEach((user) => {
      call.write(joinMessage(user.request.getUser()));
    });
    users.push(call);
    notifyChat(joinMessage(call.request.getUser()));
  },
  send: (
    call: grpc.ServerUnaryCall<ChatMessage>,
    callback: grpc.ServerUnaryCall<ChatMessage>
  ) => {
    notifyChat(call.request);
  },
  leave: (
    call: grpc.ServerUnaryCall<ChatMessage>,
    callback: grpc.ServerUnaryCall<ChatMessage>
  ) => {
    removeUser(call.request.getUser());
    notifyChat(leaveMessage(call.request.getUser()));
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
