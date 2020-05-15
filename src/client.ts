import * as grpc from "grpc";
import { ChatClient } from "./proto/service_grpc_pb";
import * as readline from "readline";
import { ChatMessage, JoinRequest, LeaveRequest } from "./proto/service_pb";

//Read terminal Lines
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

[
  "SIGHUP",
  "SIGINT",
  "SIGQUIT",
  "SIGILL",
  "SIGTRAP",
  "SIGABRT",
  "SIGBUS",
  "SIGFPE",
  "SIGUSR1",
  "SIGSEGV",
  "SIGUSR2",
  "SIGTERM",
].forEach((sig: NodeJS.Signals) => {
  process.on(sig, () => {
    leaveChat();
  });
});

const client = new ChatClient(
  "0.0.0.0:50051",
  grpc.credentials.createInsecure()
);
var username = "";

const startChat = () => {
  const req = new JoinRequest();
  req.setUser(username);
  let channel = client.join(req);

  channel.on("data", onData);

  rl.on("line", (text: string) => {
    const message = new ChatMessage();
    message.setUser(username);
    message.setText(text);
    client.send(message, () => {});
  });
};

const leaveChat = () => {
  const req = new LeaveRequest();
  req.setUser(username);
  client.leave(req, () => {});
};

const onData = (message: ChatMessage) => {
  if (message.getUser() == username) {
    return;
  }
  console.log(`${message.getUser()}: ${message.getText()}`);
};

function main() {
  rl.question("What's your name? ", (answer) => {
    username = answer;
    startChat();
  });
}

main();
