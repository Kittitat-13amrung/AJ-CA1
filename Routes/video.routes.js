const express = require("express");
const router = express.Router();
const {
	index,
	show,
	create,
	update,
	destroy,
} = require("../Controllers/video.controller");

const { loginRequired } = require("../Controllers/channels.controller");
const imageUpload = require("../config/imageUpload");

router
	.get("/", index)
	.get("/:id", show)
	.post("/create", [loginRequired, imageUpload.single("thumbnail")], create)
	.put("/:id/update", [loginRequired, imageUpload.none()], update)
	.delete("/:id/delete", [loginRequired, imageUpload.none()], destroy);

module.exports = router;
