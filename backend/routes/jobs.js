const router = require("express").Router();
const auth = require("../middleware/auth");
const { getMatchedJobs } = require("../controllers/jobsController");

router.get("/matches", auth, getMatchedJobs);

module.exports = router;
