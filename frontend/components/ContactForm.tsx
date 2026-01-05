"use client"

import React, { ChangeEvent, Dispatch, SetStateAction, useState } from 'react'

const ContactForm = ({
    name,
    firstLine,
    setName,
    setFirstLine,
    onClick
}) => {
    return (
        <div className="p-3 gap-3 flex justify-center items-center bg-red-400 w-full md:w-60 flex-col z-100 backdrop-blur-xl">
            <div className="gap-1 flex flex-col justify-start">
                <h2>Name</h2>
                <input
                    value={name}
                    placeholder="Enter contact name"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    className="rounded-lg p-1"
                />
            </div>
            <div className="gap-1 flex flex-col justify-start">
                <h2>Extra information</h2>
                <input
                    value={firstLine}
                    placeholder="Enter phone number, extra info"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFirstLine(e.target.value)}
                    className="rounded-lg p-1 focus:outline-none"
                />
            </div>

            <button onClick={onClick} className="bg-red-900 px-2 justify-end flex">
                X
            </button>
        </div>
    )
}

export default ContactForm