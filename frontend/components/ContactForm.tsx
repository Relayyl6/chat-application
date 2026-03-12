"use client";

import React, { useEffect, useState, useRef } from "react";
import { nanoid } from 'nanoid/non-secure';
import { useAppContext } from "@/context/useContext";
import { api } from "@/lib/api";

type MemberLookup = {
  id: string;
  value: string; // username input
  status: "idle" | "searching" | "found" | "not_found";
  foundUser: { _id: string; username: string } | null;
};

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
  const { createChannel } = useAppContext();

  // ─── DM username lookup ───────────────────────────────────────────────────
  const [usernameInput, setUsernameInput] = useState("");
  const [lookupStatus, setLookupStatus] = useState<"idle" | "searching" | "found" | "not_found">("idle");
  const [foundUser, setFoundUser] = useState<{ _id: string; username: string } | null>(null);
  const dmDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Group member lookups (one per member row) ────────────────────────────
  const [memberLookups, setMemberLookups] = useState<MemberLookup[]>([]);
  const memberDebounceRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Sync memberLookups length with members length
  useEffect(() => {
    setMemberLookups(prev => {
      if (members.length > prev.length) {
        const extra = members.slice(prev.length).map(m => ({
          id: m.id,
          value: "",
          status: "idle" as const,
          foundUser: null,
        }));
        return [...prev, ...extra];
      }
      return prev.filter(l => members.some(m => m.id === l.id));
    });
  }, [members]);

  // DM debounce lookup
  useEffect(() => {
    if (mode !== "dm") return;
    if (!usernameInput.trim()) {
      setLookupStatus("idle"); setFoundUser(null); setUserId(""); return;
    }
    setLookupStatus("searching"); setFoundUser(null); setUserId("");
    if (dmDebounceRef.current) clearTimeout(dmDebounceRef.current);
    dmDebounceRef.current = setTimeout(async () => {
      try {
        const user = await api.findUserByUsername(usernameInput.trim());
        if (user) { setFoundUser(user); setUserId(user._id); setLookupStatus("found"); }
        else { setLookupStatus("not_found"); setUserId(""); }
      } catch { setLookupStatus("not_found"); setUserId(""); }
    }, 500);
    return () => { if (dmDebounceRef.current) clearTimeout(dmDebounceRef.current); };
  }, [usernameInput, mode]);

  // Reset DM fields on mode switch
  useEffect(() => {
    setUsernameInput(""); setLookupStatus("idle"); setFoundUser(null); setUserId("");
    setMemberLookups([]);
  }, [mode]);

  // ─── Group member lookup handler ──────────────────────────────────────────
  const handleMemberInput = (id: string, value: string) => {
    // Update the display value in members state (used as label only now)
    setMembers(prev => prev.map(m => m.id === id ? { ...m, value } : m));

    // Update lookup state
    setMemberLookups(prev => prev.map(l =>
      l.id === id ? { ...l, value, status: "searching", foundUser: null } : l
    ));

    if (memberDebounceRefs.current[id]) clearTimeout(memberDebounceRefs.current[id]);

    if (!value.trim()) {
      setMemberLookups(prev => prev.map(l =>
        l.id === id ? { ...l, value: "", status: "idle", foundUser: null } : l
      ));
      return;
    }

    memberDebounceRefs.current[id] = setTimeout(async () => {
      try {
        const user = await api.findUserByUsername(value.trim());
        if (user) {
          setMemberLookups(prev => prev.map(l =>
            l.id === id ? { ...l, status: "found", foundUser: user } : l
          ));
          // Store the resolved userId as the member value
          setMembers(prev => prev.map(m => m.id === id ? { ...m, value: user._id } : m));
        } else {
          setMemberLookups(prev => prev.map(l =>
            l.id === id ? { ...l, status: "not_found", foundUser: null } : l
          ));
        }
      } catch {
        setMemberLookups(prev => prev.map(l =>
          l.id === id ? { ...l, status: "not_found", foundUser: null } : l
        ));
      }
    }, 500);
  };

  const addMemberInput = () => {
    const newId = nanoid();
    setMembers(prev => [...prev, { id: newId, value: "" }]);
    setMemberLookups(prev => [...prev, { id: newId, value: "", status: "idle", foundUser: null }]);
  };

  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setMemberLookups(prev => prev.filter(l => l.id !== id));
    if (memberDebounceRefs.current[id]) {
      clearTimeout(memberDebounceRefs.current[id]);
      delete memberDebounceRefs.current[id];
    }
  };

  const clearAllMembers = () => {
    setMembers([]);
    setMemberLookups([]);
  };

  // ─── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors: any = {};

    if (!name.trim()) newErrors.name = mode === "dm" ? "Contact name is required" : "Group name is required";
    if (!extraInfo.trim()) newErrors.extraInfo = "Extra information is required";

    if (mode === "dm") {
      if (!usernameInput.trim()) newErrors.username = "Username is required";
      else if (lookupStatus === "searching") newErrors.username = "Still searching...";
      else if (lookupStatus === "not_found" || !userId) newErrors.username = "User not found";
    }

    if (mode === "group") {
      if (memberLookups.length === 0) {
        newErrors.members = "Add at least one group member";
      } else {
        const stillSearching = memberLookups.some(l => l.status === "searching");
        const notFound = memberLookups.some(l => l.status === "not_found" || (l.value && l.status === "idle"));
        const noResolved = memberLookups.every(l => !l.foundUser);

        if (stillSearching) newErrors.members = "Still looking up members...";
        else if (noResolved) newErrors.members = "At least one valid member is required";
        else if (notFound) newErrors.memberFields = memberLookups
          .map((l, i) => (!l.foundUser ? i : null))
          .filter(v => v !== null);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      let channel;
      if (mode === "dm") {
        channel = await createChannel("direct", name, [userId], extraInfo);
      } else {
        // Use resolved _ids from foundUser, skip any unresolved
        const resolvedIds = memberLookups
          .filter(l => l.foundUser)
          .map(l => l.foundUser!._id);
        channel = await createChannel("group", name, resolvedIds, extraInfo);
      }

      onClick(channel._id);
      setName(""); setExtraInfo(""); setMembers([]); setMemberLookups([]);
      setUsernameInput(""); setFoundUser(null); setLookupStatus("idle"); setUserId("");
      setErrors({});
      closeModal?.();
    } catch (error) {
      console.error("Failed to create channel:", error);
      setErrors({ submit: "Failed to create channel. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (field: string) =>
    `bg-bg-input text-text-main border rounded-lg px-3 py-2 focus:outline-none ${
      errors[field] ? "border-red-500" : "border-border-subtle focus:border-brand-primary"
    }`;

  const anySearching = mode === "dm"
    ? lookupStatus === "searching"
    : memberLookups.some(l => l.status === "searching");

  return (
    <div className="p-4 gap-4 flex flex-col bg-bg-card rounded-xl w-full md:w-72 shadow-card relative">

      {/* Toggle */}
      <div className="flex justify-center">
        <div className="flex bg-bg-inner rounded-lg p-1">
          <button onClick={() => setMode("dm")}
            className={`px-4 py-1 rounded-md text-sm ${mode === "dm" ? "bg-brand-primary text-white" : "text-text-muted"}`}>
            Message
          </button>
          <button onClick={() => setMode("group")}
            className={`px-4 py-1 rounded-md text-sm ${mode === "group" ? "bg-brand-primary text-white" : "text-text-muted"}`}>
            Group
          </button>
        </div>
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1 w-full">
        <label className="text-text-muted text-sm">{mode === "dm" ? "Contact Name" : "Group Name"}</label>
        <input value={name} onChange={(e) => setName(e.target.value)}
          placeholder={mode === "dm" ? "Enter contact name" : "Enter group name"}
          className={inputStyle("name")} />
        {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
      </div>

      {/* DM username search */}
      {mode === "dm" && (
        <div className="flex flex-col gap-1 w-full">
          <label className="text-text-muted text-sm">Username</label>
          <div className="relative">
            <input value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Search by username..."
              className={`w-full bg-bg-input text-text-main border rounded-lg px-3 py-2 focus:outline-none pr-8 ${
                errors.username ? "border-red-500" : "border-border-subtle focus:border-brand-primary"
              }`} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
              {lookupStatus === "searching" && <span className="text-text-muted animate-pulse">⋯</span>}
              {lookupStatus === "found" && <span className="text-green-400">✓</span>}
              {lookupStatus === "not_found" && usernameInput && <span className="text-red-400">✕</span>}
            </span>
          </div>
          {lookupStatus === "found" && foundUser && (
            <p className="text-green-400 text-xs">Found: @{foundUser.username}</p>
          )}
          {errors.username && <p className="text-red-400 text-xs">{errors.username}</p>}
        </div>
      )}

      {/* Extra Info */}
      <div className="flex flex-col gap-1 w-full">
        <label className="text-text-muted text-sm">Extra Information</label>
        <input value={extraInfo} onChange={(e) => setExtraInfo(e.target.value)}
          placeholder="Phone, description, etc." className={inputStyle("extraInfo")} />
        {errors.extraInfo && <p className="text-red-400 text-xs">{errors.extraInfo}</p>}
      </div>

      {/* Group Members — now with username lookup per row */}
      {mode === "group" && (
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between">
            <label className="text-text-muted text-sm">Group Members</label>
            {members.length > 1 && (
              <button type="button" onClick={clearAllMembers} className="text-xs text-red-400 hover:text-red-500">
                Clear all
              </button>
            )}
          </div>

          <div className="max-h-40 overflow-y-auto no-scrollbar pr-1 flex flex-col gap-2">
            {members.map((member, index) => {
              const lookup = memberLookups.find(l => l.id === member.id);
              return (
                <div key={member.id} className="flex flex-col gap-0.5">
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <input
                        value={lookup?.value ?? ""}
                        onChange={(e) => handleMemberInput(member.id, e.target.value)}
                        placeholder={`Member ${index + 1} username`}
                        className={`w-full no-scrollbar bg-bg-input text-text-main border rounded-lg px-3 py-2 pr-8 focus:outline-none ${
                          errors.memberFields?.includes(index)
                            ? "border-red-500"
                            : "border-border-subtle focus:border-brand-primary"
                        }`}
                      />
                      {/* Per-row status indicator */}
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                        {lookup?.status === "searching" && <span className="text-text-muted animate-pulse">⋯</span>}
                        {lookup?.status === "found" && <span className="text-green-400">✓</span>}
                        {lookup?.status === "not_found" && lookup.value && <span className="text-red-400">✕</span>}
                      </span>
                    </div>
                    <button type="button" onClick={() => removeMember(member.id)}
                      className="text-text-muted hover:text-red-400 text-sm px-1 shrink-0">
                      ✕
                    </button>
                  </div>
                  {/* Found user confirmation */}
                  {lookup?.status === "found" && lookup.foundUser && (
                    <p className="text-green-400 text-xs ml-1">@{lookup.foundUser.username}</p>
                  )}
                </div>
              );
            })}
          </div>

          {errors.members && <p className="text-red-400 text-xs">{errors.members}</p>}

          <button type="button" onClick={addMemberInput}
            className="text-sm bg-bg-inner border border-border-subtle text-text-main py-2 px-3 rounded-lg hover:border-brand-primary w-fit">
            + Add Member
          </button>
        </div>
      )}

      {errors.submit && <p className="text-red-400 text-xs text-center">{errors.submit}</p>}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || anySearching}
        className={`py-2 rounded-lg mt-2 ${
          isSubmitting || anySearching
            ? "bg-gray-500 text-button-light-text cursor-not-allowed"
            : "bg-black text-button-light-text hover:bg-button-light-hover"
        }`}
      >
        {isSubmitting ? "Creating..." : `Create ${mode === "dm" ? "Chat" : "Group"}`}
      </button>

      <button onClick={closeModal} className="absolute top-3 right-3 text-text-muted hover:text-white text-sm">
        ✕
      </button>
    </div>
  );
};

export default ContactForm;
