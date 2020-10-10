const express = require('express');
const router = express.Router();
const multer = require('multer');
// var ffmpeg = require('fluent-ffmpeg');

const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');

const { Video } = require("../models/Video");
const { Subscriber } = require("../models/Subscriber");
const { auth } = require("../middleware/auth");

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if (ext !== '.mp4') {
            return cb(res.status(400).end('only jpg, png, mp4 is allowed'), false);
        }
        cb(null, true)
    }
})
cloudinary.config({
    cloud_name: 'dzts4fqgy',
    api_key: '412193291915112',
    api_secret: '0w4LrPfq6dEA2KFsrXaSC3Nh56E'
});

// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//       folder: 'test',
//     //   format: 'mp4', // supports promises as well
//     //   resource_type: 'video',
//       filename: (req, file, cb) => {
//         cb(null, `${Date.now()}_${file.originalname}`)
//       },
//       fileFilter: (req, file, cb) => {
//         const ext = path.extname(file.originalname)
//         if (ext !== '.mp4') {
//             return cb(res.status(400).end('only jpg, png, mp4 is allowed'), false);
//         }
//         cb(null, true)
//       },
//     },
//   });
   

var upload = multer({ storage: storage })


//=================================
//             User
//=================================


router.post("/uploadfiles", upload.single("file"), async function (req, res) {
    console.log('HEY!')

    // upload(req, res, err => {
    //     console.log(req.file)
    //     if (err) {
    //         return res.json({ success: false, err })
    //     }
    //     // return res.json({ success: true, filePath: res.req.file.path, fileName: res.req.file.filename })
    //     res.end("file uploaded")
    // })
    try {
        console.log(req.file)
        const result = await cloudinary.uploader.upload(req.file.path, 
            {
                eager:{
                    start_offset: "auto",
                    width: 320,
                    height: 240,
                    format: "png"
                } ,
                resource_type: "video"
            }
        );

        console.log(result)
        return res.json({ 
            success: true, 
            filePath: result.secure_url, 
            fileName: req.file.filename,
            fileDuration: result.duration,
            thumbsFilePath: result.eager[0].secure_url
        })
        // res.end("file uploaded")
    } catch (err) {
        console.log(err)
        return res.json({ success: false, err })
    }


});


// router.post("/thumbnail", (req, res) => {

//     let thumbsFilePath ="";
//     let fileDuration ="";

//     ffmpeg.ffprobe(req.body.filePath, function(err, metadata){
//         console.dir(metadata);
//         console.log(metadata.format.duration);

//         fileDuration = metadata.format.duration;
//     })


//     ffmpeg(req.body.filePath)
//         .on('filenames', function (filenames) {
//             console.log('Will generate ' + filenames.join(', '))
//             thumbsFilePath = "uploads/thumbnails/" + filenames[0];
//         })
//         .on('end', function () {
//             console.log('Screenshots taken');
//             return res.json({ success: true, thumbsFilePath: thumbsFilePath, fileDuration: fileDuration})
//         })
//         .screenshots({
//             // Will take screens at 20%, 40%, 60% and 80% of the video
//             count: 3,
//             folder: 'uploads/thumbnails',
//             size:'320x240',
//             // %b input basename ( filename w/o extension )
//             filename:'thumbnail-%b.png'
//         });

// });




router.get("/getVideos", (req, res) => {

    Video.find()
        .populate('writer')
        .exec((err, videos) => {
            if(err) return res.status(400).send(err);
            res.status(200).json({ success: true, videos })
        })

});



router.post("/uploadVideo", (req, res) => {

    const video = new Video(req.body)

    video.save((err, video) => {
        if(err) return res.status(400).json({ success: false, err })
        return res.status(200).json({
            success: true 
        })
    })

});


router.post("/getVideo", (req, res) => {

    Video.findOne({ "_id" : req.body.videoId })
    .populate('writer')
    .exec((err, video) => {
        if(err) return res.status(400).send(err);
        res.status(200).json({ success: true, video })
    })
});


router.post("/getSubscriptionVideos", (req, res) => {


    //Need to find all of the Users that I am subscribing to From Subscriber Collection 
    
    Subscriber.find({ 'userFrom': req.body.userFrom })
    .exec((err, subscribers)=> {
        if(err) return res.status(400).send(err);

        let subscribedUser = [];

        subscribers.map((subscriber, i)=> {
            subscribedUser.push(subscriber.userTo)
        })


        //Need to Fetch all of the Videos that belong to the Users that I found in previous step. 
        Video.find({ writer: { $in: subscribedUser }})
            .populate('writer')
            .exec((err, videos) => {
                if(err) return res.status(400).send(err);
                res.status(200).json({ success: true, videos })
            })
    })
});

module.exports = router;
