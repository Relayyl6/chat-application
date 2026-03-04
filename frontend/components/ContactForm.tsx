"use client";

import React, { useEffect, useState } from "react";
import { nanoid } from 'nanoid/non-secure';
import { useChannels } from "@/hooks/useChannels";

const ContactForm = ({
    name,
    setName,
    userId,
    setUserId,
    mode,
    setMode,
    extraInfo,
    setExtraInfo,
    members,
    setMembers,
    onClick,
    closeModal
} : ContactProp) => {
  
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingOpen, setIsAddingOpen] = useState(true);
  const { createChannel } = useChannels();

  const addMemberInput = () => {
   if (!isAddingOpen) return; 

   const newMember = {
     id: nanoid(), // NEW unique ID every click
     value: "",
   }; 

   setMembers((prev) => [...prev, newMember]);
  };

  const updateMember = (id: string, value: string) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, value } : member
      )
    );
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== id));
  };

  const closeMembers = () => {
    setIsAddingOpen(false);
  };

  const openMembers = () => {
    setIsAddingOpen(true);
  };

  const validate = () => {
    const newErrors: any = {};

    if (!name.trim()) newErrors.name = mode === "dm" ? "Contact name is required" : "Group name is required";
    if (!extraInfo.trim()) newErrors.extraInfo = "Extra information is required";

    if (mode === "dm") {
      if (!userId.trim()) newErrors.userId = "User ID is required";
    }

    if (mode === "group") {
      const emptyIndexes = members
        .map((m, i) => (!m.value.trim() ? i : null))
        .filter((v) => v !== null);

      if (members.length === 0 || emptyIndexes.length === members.length) {
        newErrors.members = "Add at least one group member";
      } else if (emptyIndexes.length > 0) {
        newErrors.memberFields = emptyIndexes;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let channel;

      if (mode === "dm") {
        // For DM: create channel with single user on submit
        channel = await createChannel(
          "direct",
          name,
          [userId],
          extraInfo
        );
        console.log("DM channel created successfully:", channel);
      } else {
        // For group: create channel with all members at once on submit
        const validMembers = members
          .map((m) => m.value.trim())
          .filter((v) => v);
        channel = await createChannel(
          "group",
          name,
          validMembers,
          extraInfo
        );
        console.log("Group channel created successfully:", channel);
      }

      onClick(channel._id);
      
      // Reset form
      setName("");
      setExtraInfo("");
      setMembers([]);
      setIsAddingOpen(true);
      setUserId(nanoid());
      setErrors({});
      closeModal();
    } catch (error) {
      console.error("Failed to create channel:", error);
      setErrors({ submit: "Failed to create channel. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const id = nanoid();
    setUserId(id);
  }, []);

  const inputStyle = (field: string) =>
    `bg-bg-input text-text-main border rounded-lg px-3 py-2 focus:outline-none ${
      errors[field] ? "border-red-500" : "border-border-subtle focus:border-brand-primary"
    }`;

  return (
    <div className="p-4 gap-4 flex flex-col bg-bg-card rounded-xl w-full md:w-72 shadow-card relative">

      {/* Toggle */}
      <div className="flex justify-center">
        <div className="flex bg-bg-inner rounded-lg p-1">
          <button
            onClick={() => setMode("dm")}
            className={`px-4 py-1 rounded-md text-sm ${mode === "dm" ? "bg-brand-primary text-white" : "text-text-muted"}`}
          >
            Message
          </button>
          <button
            onClick={() => setMode("group")}
            className={`px-4 py-1 rounded-md text-sm ${mode === "group" ? "bg-brand-primary text-white" : "text-text-muted"}`}
          >
            Group
          </button>
        </div>
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1 w-full">
        <label className="text-text-muted text-sm">
          {mode === "dm" ? "Contact Name" : "Group Name"}
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={mode === "dm" ? "Enter contact name" : "Enter group name"}
          className={inputStyle("name")}
        />
        {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
      </div>

      {/* DM User ID */}
      {mode === "dm" && (
        <div className="flex flex-col gap-1 w-full">
          <label className="text-text-muted text-sm">User ID</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID"
            className={inputStyle("userId")}
          />
          {errors.userId && <p className="text-red-400 text-xs">{errors.userId}</p>}
        </div>
      )}

      {/* Extra Info */}
      <div className="flex flex-col gap-1 w-full">
        <label className="text-text-muted text-sm">Extra Information</label>
        <input
          value={extraInfo}
          onChange={(e) => setExtraInfo(e.target.value)}
          placeholder="Phone, description, etc."
          className={inputStyle("extraInfo")}
        />
        {errors.extraInfo && <p className="text-red-400 text-xs">{errors.extraInfo}</p>}
      </div>

      {/* Group Members */}
      {mode === "group" && (
        <div className="flex flex-col gap-2 w-full">
          <label className="text-text-muted text-sm">Group Members</label>

          <div className="max-h-32 overflow-y-auto no-scrollbar pr-1 flex flex-col gap-2">
            {members.map((member, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  value={member.value}
                  onChange={(e) => updateMember(member.id, e.target.value)}
                  placeholder={`Member ${index + 1} ID`}
                  className={`no-scrollbar flex-1 bg-bg-input text-text-main border rounded-lg px-3 py-2 focus:outline-none ${
                    errors.memberFields?.includes(index)
                      ? "border-red-500"
                      : "border-border-subtle focus:border-brand-primary"
                  }`}
                />
                {member.value && (
                  <button
                    type="button"
                    onClick={() => removeMember(member.id)}
                    className="text-red-400 hover:text-red-500 text-sm px-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {errors.members && <p className="text-red-400 text-xs">{errors.members}</p>}

          <div className="flex gap-2">
            {isAddingOpen && (
              <button
                type="button"
                onClick={addMemberInput}
                className="text-sm bg-bg-inner border border-border-subtle text-text-main py-2 px-3 rounded-lg hover:border-brand-primary"
              >
                + Add Member
              </button>
            )}

            <button
              type="button"
              onClick={closeMembers}
              className="text-sm text-red-400 border border-red-400 px-3 py-2 rounded-lg"
            >
              Close Members
            </button>
          </div>
        </div>
      )}

      {/* Submit Error */}
      {errors.submit && <p className="text-red-400 text-xs text-center">{errors.submit}</p>}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`py-2 rounded-lg mt-2 ${
          isSubmitting
            ? "bg-gray-500 text-button-light-text cursor-not-allowed"
            : "bg-black text-button-light-text hover:bg-button-light-hover"
        }`}
      >
        {isSubmitting ? "Creating..." : `Create ${mode === "dm" ? "Chat" : "Group"}`}
      </button>

      {/* Close */}
      <button
        onClick={closeModal}
        className="absolute top-3 right-3 text-text-muted hover:text-white text-sm"
      >
        ✕
      </button>
    </div>
  );
};

export default ContactForm;
