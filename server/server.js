var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// User-wise codeBlocks state
var blocksState = [
  { id: "codeBlock1", users: [] },
  { id: "codeBlock2", users: [] },
  { id: "codeBlock3", users: [] },
  { id: "codeBlock4", users: [] },
];

const io = require("socket.io")(process.env.PORT || 3001, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

// Configure clients connection.
io.on("connection", (socket) => {
  const sid = socket.id;

  // Client initiate "room" and editor with initial code block content.
  socket.on("get-block", async (blockId) => {
    const block = await getBlock(blockId);
    registerBlock(sid, blockId);
    socket.join(blockId);
    console.log("user", sid, "joined room", blockId);

    socket.emit("load-block", block, getUsersCount(blockId));
    // Client cause text changes event, sent only to matching room.
    socket.on("send-changes", (delta) => {
      // Broadcast all the text-change, besides the client that changed.
      socket.broadcast.to(blockId).emit("receive-changes", delta);
    });

    socket.on("save-block", (data) => updateBlock(blockId, data));
  });

  socket.on("get-blocks", async () => {
    const blocks = await getBlocks();
    // blocks.forEach((doc) => console.log(doc.data()));
    const codeBlcoks = [];
    blocks.forEach((doc) => {
      codeBlcoks.push(doc.data());
    });
    socket.emit("receive-blocks", codeBlcoks);
  });

  socket.on("disconnect", (something) => {
    unRegisterBlock(sid);
    console.log("user disconnected:", socket.id);
    console.log(blocksState);
  });
});

const getBlock = async (blockId) => {
  if (blockId == null) return;

  const block = await db
    .collection("codeBlocks")
    .doc(blockId)
    .get()
    .catch("error while getting document");

  return block.data();
};

const getBlocks = async () => {
  const blocks = await db
    .collection("codeBlocks")
    .get()
    .catch("error while getting document");

  return blocks;
};

const updateBlock = async (blockId, data) => {
  await db
    .collection("codeBlocks")
    .doc(blockId)
    .update({ code: data })
    .then(console.log("saved changes1"));
};

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
  console.log(blocksState);
};

const unRegisterBlock = (userId) => {
  blocksState.map((block) => {
    block.users.map((user, index) => {
      if (user === userId) {
        block.users.splice(index, 1);
      }
    });
  });
  console.log("unRegisterBlock", blocksState);
};

const getUsersCount = (blockId) => {
  const currBlock = getCurrBlock(blockId);
  if (!currBlock) return -1;
  return currBlock.users.length;
};

console.log("server is running...");
console.log(blocksState);
