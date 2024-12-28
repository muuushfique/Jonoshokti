import { useState, useEffect } from "react"
import axios from "axios"

function Contact() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [selectData, setSelectData] = useState([])
    const [selectValue, setSelectValue] = useState('')

    useEffect(() => {
        let processing = true
        axiosFetchData(processing)
        return () => {
            processing = false
        }
    }, [])

    const axiosFetchData = async (processing) => {
        await axios.get('http://localhost:1241/users')
            .then(res => {
                if (processing) {
                    setSelectData(res.data)
                }
            })
            .catch(err => console.log(err))
    }

    const axiosPostData = async () => {
        const postData = {
            email: email,
            website: selectValue,
            message: message
        }
        try {
            const response = await axios.post('http://localhost:1241/contact', postData);
            setError(<p className="text-green-500">{response.data}</p>);
        } catch (err) {
            console.error('Axios Error:', err);
            setError(<p className="text-red-500">Network Error: {err.message}</p>);
        }
    }

    const SelectDropdown = () => {
        return (
            <select 
                value={selectValue} 
                onChange={(e) => setSelectValue(e.target.value)} 
                className="select select-bordered w-full p-2 mt-2 bg-white"
            >
                <option value="" key="none"> -- Select One -- </option>
                {
                    selectData?.map((item) => (
                        <option value={item.website} key={item.website}>{item.website}</option>
                    ))
                }
            </select>
        )
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!message) {
            setError(<p className="text-yellow-600">Message is empty. Please type a message.</p>)
        } else {
            setError('')
            axiosPostData()
        }
    }

    return (
        <>
        
            <form className="w-full max-w-lg mx-auto p-8 shadow-lg rounded-lg">
            <label className="block text-center w-full text-2xl font-bold mb-4">Contact Us</label>

                <label className="block text-lg mb-2">Email</label>
                <input 
                    type="text" 
                    id="email" 
                    name="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="input input-bordered w-full p-2 mb-4 bg-white"
                />

                <label className="block text-lg mb-2">How Did You Hear About Us?</label>
                <SelectDropdown />

                <label className="block text-lg mb-2">Message</label>
                <textarea 
                    id="message" 
                    name="message" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    className="textarea textarea-bordered w-full p-2 mb-4 bg-white"
                ></textarea>
                
                {error}

                {/* DaisyUI Button */}
                <button 
                    type="submit" 
                    onClick={handleSubmit} 
                    className="btn btn-primary mt-4 w-full"
                >
                    Submit
                </button>
            </form>
        </>
    )
}

export default Contact
