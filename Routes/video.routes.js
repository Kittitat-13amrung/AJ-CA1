const express = require("express");
const router = express.Router();
const {
	index,
	show,
	random,
	showComments,
	create,
	update,
	destroy,
	likeVideo,
    dislikeVideo
} = require("../Controllers/video.controller");

const { loginRequired } = require("../Controllers/channels.controller");
const imageUpload = require("../config/imageUpload");

router
	.get("/", index)
	.get("/random/:tag", random)
	.get("/:id", show)
	.get('/:id/comments', showComments)
	.post("/:id/like", loginRequired, likeVideo)
	.post("/:id/dislike", loginRequired, dislikeVideo)
	.post("/create", [loginRequired, imageUpload.single("thumbnail")], create)
	.put("/:id/update", [loginRequired, imageUpload.none()], update)
	.delete("/:id/delete", [loginRequired, imageUpload.none()], destroy);

module.exports = router;
