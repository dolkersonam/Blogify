const {Router} = require("express");
const multer = require('multer');
const path = require('path');
const sanitizeHtml = require('sanitize-html');


const router = Router();

const Blog = require('../models/blogs')
const Comment = require('../models/comments')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads`))
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`
    cb(null, fileName);
  }
})
const upload = multer({ storage: storage })

router.get('/add-new' , (req ,res) => {
    return res.render("addBlog" , {
        user : req.user,
    });
});

router.get('/:id' , async (req,res)=>{
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId : req.params.id}).populate(
    "createdBy"
  );
  return res.render("blog" , {
    user: req.user,
    blog,
    comments,
  })
})

router.post('/comment/:blogId' , async (req,res)=>{
  await Comment.create({
    content : req.body.content,
    blogId : req.params.blogId,
    createdBy : req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`)
})

router.post('/' , upload.single('coverImage'), async (req, res)=>{
    const {body, title} = req.body;
    const cleanBody = sanitizeHtml(body, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'u', 'b', 'i', 'strong', 'em', 'p']),
    allowedAttributes: {
      'img': ['src', 'alt', 'style'],
      '*': ['style']
    },
  });

  const blog = await Blog.create({
    title,
    body: cleanBody,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`
  });

  return res.redirect(`/blog/${blog._id}`);
})

module.exports = router;