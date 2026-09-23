const express = require("express");
const { showAllPostedJobs,showAParticularJob,postNewJob,deletePostedJob,editPostedJob,patchEditPostedJob } = require("../controllers/jobController")

const router = express.Router();

// your job routes here

router.get("/",showAllPostedJobs)
router.get("/:id",showAParticularJob)

router.post("/",postNewJob)

router.put("/:id",editPostedJob)


router.patch("/:id",patchEditPostedJob)

router.delete("/:id",deletePostedJob)

module.exports = router;