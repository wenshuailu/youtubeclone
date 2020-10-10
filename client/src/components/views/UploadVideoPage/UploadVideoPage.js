import React, { useState, useEffect } from 'react'
import { Typography, Button, Form, Progress, Input, Icon } from 'antd';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import { useSelector } from "react-redux";
import './UploadVideoPage.css';

const { Title } = Typography;
const { TextArea } = Input;

const Private = [
    { value: 0, label: 'Private' },
    { value: 1, label: 'Public' }
]

const Catogory = [
    { value: 0, label: "Film & Animation" },
    { value: 0, label: "Autos & Vehicles" },
    { value: 0, label: "Music" },
    { value: 0, label: "Pets & Animals" },
    { value: 0, label: "Sports" },
]

function UploadVideoPage(props) {
    const user = useSelector(state => state.user);

    const [title, setTitle] = useState("");
    const [Description, setDescription] = useState("");
    const [privacy, setPrivacy] = useState(0)
    const [Categories, setCategories] = useState("Film & Animation")
    const [FilePath, setFilePath] = useState("")
    const [Duration, setDuration] = useState("")
    const [Thumbnail, setThumbnail] = useState("")
    const [progress, setProgress] = useState(0)


    const handleChangeTitle = (event) => {
        setTitle(event.currentTarget.value)
    }

    const handleChangeDecsription = (event) => {
        console.log(event.currentTarget.value)

        setDescription(event.currentTarget.value)
    }

    const handleChangeOne = (event) => {
        setPrivacy(event.currentTarget.value)
    }

    const handleChangeTwo = (event) => {
        setCategories(event.currentTarget.value)
    }

    const onSubmit = (event) => {

        event.preventDefault();

        if (user.userData && !user.userData.isAuth) {
            return alert('Please Log in First')
        }

        if (title === "" || Description === "" ||
            Categories === "" || FilePath === "" ||
            Duration === "" || Thumbnail === "") {
            return alert('Please first fill all the fields')
        }

        const variables = {
            writer: user.userData._id,
            title: title,
            description: Description,
            privacy: privacy,
            filePath: FilePath,
            category: Categories,
            duration: Duration,
            thumbnail: Thumbnail
        }

        axios.post('/api/video/uploadVideo', variables)
            .then(response => {
                if (response.data.success) {
                    alert('video Uploaded Successfully')
                    props.history.push('/')
                } else {
                    alert('Failed to upload video')
                }
            })

    }

    const onDrop = (files) => {
        setThumbnail("")
        let formData = new FormData();
        const config = {
            header: { 'content-type': 'multipart/form-data' },
            onUploadProgress: event =>{
                const percent = Math.floor((event.loaded / event.total) * 100);
                setProgress(percent);
                // if (percent === 100) {
                //     setTimeout(() => setProgress(0), 1000);
                // }
            },
            // onDownloadProgress: progressEvent => {
            //     const percentCompleted = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
            //     console.log(progressEvent.lengthComputable)
            //     console.log(percentCompleted);
            // }
        }
        console.log(files)
        formData.append("file", files[0])
        // const reader = new FileReader()

        // reader.onabort = () => console.log('file reading was aborted')
        // reader.onerror = () => console.log('file reading has failed')
        // reader.onload = () => {
        // // Do whatever you want with the file contents
        //   const binaryStr = reader.result
        //   console.log(binaryStr)
        // }

        // reader.readAsArrayBuffer(file)

        // axios.post("/api/video/uploadfiles", formData)
        // .then(res => console.log(res))
        // .catch(err => console.log(err))
        axios.post('/api/video/uploadfiles', formData, config)
            .then(response => {
                console.log(formData)
                if (response.data.success) {
                    // console.log(response)
                    // let variable = {
                    //     filePath: response.data.filePath,
                    //     fileName: response.data.fileName
                    // }
                    setProgress(0)
                    setFilePath(response.data.filePath)
                    setDuration(response.data.fileDuration)
                    setThumbnail(response.data.thumbsFilePath)

                    //gerenate thumbnail with this filepath ! 

                    // axios.post('/api/video/thumbnail', variable)
                    //     .then(response => {
                    //         if (response.data.success) {
                    //             setDuration(response.data.fileDuration)
                    //             setThumbnail(response.data.thumbsFilePath)
                    //         } else {
                    //             alert('Failed to make the thumbnails');
                    //         }
                    //     })


                } else {
                    alert('failed to save the video in server')
                }
            })

    }

    return (
        <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Title level={2} > Upload Video</Title>
            </div>

            <Form onSubmit={onSubmit}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Dropzone
                        onDrop={onDrop}
                        multiple={false}
                        maxSize={800000000}>
                        {({ getRootProps, getInputProps }) => (
                            <div className="dropzone-item" style={{ width: '300px', height: '240px', border: '1px solid lightgray', display: 'flex', alignItems: 'center', justifyContent: 'center', flexBasis: '100%' }}
                                {...getRootProps()}
                            >
                                <input {...getInputProps()} />
                                <Icon type="plus" style={{ fontSize: '3rem' }} />

                            </div>
                        )}
                    </Dropzone>
                    {progress > 0 &&
                    <div className="dropzone-item thumbnail-status">
                        <Progress type="circle" percent={progress} />
                    </div>
                    } 

                    {/* <div>
                        <img src={`${Thumbnail}`} alt="haha" />
                    </div> */}
                        {/* {Thumbnail !== "" ? <img src={`${Thumbnail}`} alt="haha" /> :null} */}

                    

                    {Thumbnail !== "" &&
                        <div className="dropzone-item thumbnail">
                            <img src={`${Thumbnail}`} alt="thumbnail" />
                        </div>
                    }
                </div>

                <br /><br />
                <label>Title</label>
                <Input
                    onChange={handleChangeTitle}
                    value={title}
                />
                <br /><br />
                <label>Description</label>
                <TextArea
                    onChange={handleChangeDecsription}
                    value={Description}
                />
                <br /><br />

                <select onChange={handleChangeOne}>
                    {Private.map((item, index) => (
                        <option key={index} value={item.value}>{item.label}</option>
                    ))}
                </select>
                <br /><br />

                <select onChange={handleChangeTwo}>
                    {Catogory.map((item, index) => (
                        <option key={index} value={item.label}>{item.label}</option>
                    ))}
                </select>
                <br /><br />

                <Button type="primary" size="large" onClick={onSubmit}>
                    Submit
            </Button>

            </Form>
        </div>
    )
}

export default UploadVideoPage
