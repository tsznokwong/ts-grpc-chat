import * as grpc from "grpc";
import { ChatClient } from "./proto/service_grpc_pb";
import * as readline from "readline";
import { ChatMessage } from "./proto/service_pb";

//Read terminal Lines
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = new ChatClient(
  "0.0.0.0:50051",
  grpc.credentials.createInsecure()
);
var username = "";

function startChat() {
  let channel = client.join({ user: username });

  channel.on("data", onData);

  rl.on("line", (text: string) => {
    const message = new ChatMessage();
    message.setUser(username);
    message.setText(text);
    client.send(message, () => {});
  });
}

function onData(message: ChatMessage) {
  if (message.getUser() == username) {
    return;
  }
  console.log(`${message.getUser()}: ${message.getText()}`);
}

function main() {
  rl.question("What's your name? ", (answer) => {
    username = answer;
    startChat();
  });
}

main();
