const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getRequests,
  getSuggestions,
} = require("../controllers/friendController");

router.post("/send", auth, sendRequest);
router.post("/accept", auth, acceptRequest);
router.post("/reject", auth, rejectRequest);
router.get("/", auth, getRequests);
router.get("/suggestions", auth, getSuggestions);

module.exports = router;
