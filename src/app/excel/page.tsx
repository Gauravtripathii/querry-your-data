"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import * as xlsx from "xlsx";
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AttachFileIcon from '@mui/icons-material/AttachFile';

export default function Excel() {
    const [jsonData, setJsonData] = useState<any>(null);
    const [filename, setFilename] = useState<String>("");
    const [fileClicked, setFileClicked] = useState<Boolean>(false);
    const [query, setQuery] = useState<string | number>("");
    const [answer, setAnswer] = useState<string>("");

    const readUploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        if (event.target.files) {
            const reader = new FileReader();
            reader.onload = e => {
                const data = e.target?.result;
                const workbook = xlsx.read(data, { type: "array" });
                const sheetname = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetname];
                const json = xlsx.utils.sheet_to_json(worksheet);
                setJsonData(json);
                setFilename(event.target.files![0].name);
            };
            reader.readAsArrayBuffer(event.target.files[0]);
        }
        setFileClicked(false);
    }

    const fileBtnClicked = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        setFileClicked(!fileClicked);
    }

    const askGroq = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        console.log(query);
        await axios.post("/api/askQuestion", {jsonData, query})
        .then(response => {
            if (response.status === 200) {
                setAnswer(response.data.answer);
            }
        })
        .catch(error => {
            if (error.status === 500) {
                console.log(error);
            }
        })
        .finally(() => {
            console.log("API Call Finished!");
        });
    }

    useEffect(() => {
        console.log(jsonData);
    }, [jsonData]);

    return (
        <div className="w-full h-screen flex items-center justify-center">

            <form className="w-full h-full flex flex-col gap-5 p-5 relative">
                <p className={fileClicked ? "flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border rounded-lg" : "hidden"}>
                    <input type="file" name="upload" id="upload" onChange={readUploadFile} />
                </p>
                <div className="h-full w-full border rounded-lg p-3">
                    {/* <p className={query ? "" : "hidden"}>Query:<br />{query}</p> */}
                    <p className={answer ? "" : "hidden"}>{answer}</p>
                </div>
                {/* MAIN OF QUERY */}
                <div className="flex gap-2 relative">
                    {/* FILENAME */}
                    <div className={jsonData ? "border rounded-md p-2 absolute -top-[120%] -left-2" : "hidden"}>
                        <span>{filename}</span>
                    </div>
                    <button onClick={fileBtnClicked}><AttachFileIcon /></button>
                    <input
                        type="text"
                        placeholder="Enter your query here!"
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                        className="w-full border border-black rounded-md text-lg px-3 py-1"
                    />
                    <button onClick={askGroq}><AutoFixHighIcon /></button>
                </div>
            </form>
        </div>
    )
}

