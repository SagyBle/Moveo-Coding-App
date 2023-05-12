var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const blocksState = [
  { id: "codeBlock1", users: ["sagy123", "moshe123"] },
  { id: "codeBlock2", users: [] },
  { id: "codeBlock3", users: [] },
  { id: "codeBlock4", users: [] },
];

const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Configure clients connection.
io.on("connection", (socket) => {
  const sid = socket.id;

  // Client initiate "room" and editor with initial code block content.
  socket.on("get-block", async (blockId) => {
    const block = await getBlock(blockId);
    // const block = { code: "bla bla bla" };
    socket.join(blockId);
    console.log("user", sid, "joined room", blockId);
    socket.on("leave", (room) => {
      console.log(`Client left room ${room}`);
    });
    // write to

    socket.emit("load-block", block.code);
    // Client cause text changes event, sent only to matching room.
    socket.on("send-changes", (delta) => {
      // Broadcast all the text-change, besides the client that changed.
      socket.broadcast.to(blockId).emit("receive-changes", delta);
    });

    socket.on("save-block", (data) => updateBlock(blockId, data));

    socket.on("try", () => {
      console.log("try!");
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

// return code block json object:
// {code: ... , title: ...}
const getBlock = async (blockId) => {
  if (blockId == null) return;
  // let codeBlocksRef = db.collection("codeBlocks");
  // const block = await

  const block = await db
    .collection("codeBlocks")
    .doc(blockId)
    .get()
    .catch("error while getting document");
  // console.log("1sagy", block.data());

  return block.data();
};

const updateBlock = async (blockId, data) => {
  await db
    .collection("codeBlocks")
    .doc(blockId)
    .update({ code: data })
    .then(console.log("saved changes"));
};
// const data1 = { code: "new code sagy sagy" };
// db.collection("codeBlocks")
//   .doc("codeBlock3")
//   .update(data1)
//   .then(console.log("saved changes"));

const getCurrBlock = (blockId) => {
  const currBlock = blocksState.find((block) => block.id === blockId);
  return currBlock;
};

const registerBlock = (userId, blockId) => {
  const currBlock = getCurrBlock(blockId);
  if (!currBlock) {
    console.log("block not found");
    return;
  }

  if (!currBlock.users.some((user) => user === userId)) {
    currBlock.users.push(userId);
  }

  console.log(currBlock);
};

const unRegisterBlock = (userId, blockId) => {
  const currBlock = getCurrBlock(blockId);
  if (!currBlock) {
    console.log("block not found");
    return;
  }
  const indexToRemove = currBlock.users.findIndex((user) => user === userId);
  if (indexToRemove != -1) {
    currBlock.users.splice(indexToRemove, 1);
  }
};

const getUsersCount = (blockId) => {
  const currBlock = getCurrBlock(blockId);
  if (!currBlock) return -1;
  return currBlock.users.length;
};

console.log("server is running...");
