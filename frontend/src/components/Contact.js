import { useState, useEffect } from "react"
import axios from "axios"

function Contact() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [selectData, setSelectData] = useState([])
    const [selectValue, setSelectValue] = useState('')

    useEffect( () => {
        let processing = true
        axiosFetchData(processing)
        return () => {
            processing = false
        }
    },[])

    const axiosFetchData = async(processing) => {
        await axios.get('http://localhost:1241/users')
        .then(res => {
            if (processing) {
                setSelectData(res.data)
            }
        })
        .catch(err => console.log(err))
    }

    const axiosPostData = async() => {
        const postData = {
            email: email,
            website: selectValue,
            message: message
        }
        try {
            const response = await axios.post('http://localhost:1241/contact', postData);
            setError(<p className="success">{response.data}</p>);
        } catch (err) {
            console.error('Axios Error:', err);
            setError(<p className="error">Network Error: {err.message}</p>);
        }
    }

    const SelectDropdown = () => {
        return (
            <select value={selectValue} onChange={(e) => setSelectValue(e.target.value)}>
                <option value="" key="none"> -- Select One -- </option>
                {
                    selectData?.map( (item) => (
                        <option value={item.website} key={item.website}>{item.website}</option>
                    ))
                }
            </select>
        )
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!message) {
            setError(<p className="required">Message is empty. Please type a message.</p>)
        } else {
            setError('')
            axiosPostData()
        }
    }

    return (
        <>
        
            <h1>Contact Us</h1>

            <form className="contactForm">
                <label>Email</label>
                <input type="text" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />

                <label>How Did You Hear About Us?</label>
                <SelectDropdown />

                <label>Message</label>
                <textarea id="message" name="message" value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
                
                {error}

                <button type="submit" onClick={handleSubmit}>Submit</button>
            </form>
        </>
    )
}

export default Contact