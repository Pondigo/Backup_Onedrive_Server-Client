// React
import React, { useState } from 'react'
//import searcher from "../../../server/searchOnAmazon.Mjs/index.js"
import axios from 'axios';
//
export default function SearchBar() {

    var [textToSearch, setTextToSearch] = useState('')
    const keyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.keyCode === 13) {
            console.log(textToSearch);
            axios.post(`http://localhost:3001/startBackUp`, { address:textToSearch })
                .then(res => {
                    console.log(res);
                    //console.log(res.data);
                })

        }
    }

    return (
        <div className='searchBarDiv'>
            <input type="text" id='inputText' className='searchInput' placeholder='Buscar' onKeyDown={keyDownHandler} onChange={(e) => setTextToSearch(e.target.value)} />
        </div>
    )
}
