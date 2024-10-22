import React, { useEffect, useState } from "react";
import Ticket from "./Ticket"; // Ensure Ticket component renders correctly
const API_URL = "https://api.quicksell.co/v1/internal/frontend-assignment";
const priorities = ["No Priority", "Low", "Medium", "High", "Urgent"];

const statuses = ["Todo", "In progress", "Backlog", "Done", "canceled"];

function KanbanBoard() {
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [grouping, setGrouping] = useState(() => localStorage.getItem("grouping") || "status");
    const [sortBy, setSortBy] = useState(() => localStorage.getItem("sortBy") || "priority");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setTickets(data.tickets || []);
                setUsers(data.users || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        localStorage.setItem("grouping", grouping);
        localStorage.setItem("sortBy", sortBy);
    }, [grouping, sortBy]);

    const groupTickets = (tickets) => {
        const fixedStatuses = {
            "Todo": [],
            "Canceled": [],
            "In progress": [],
            "Done": [],
            "Backlog": []
        };

        const fixedPriorities = {
            "Urgent": [],
            "High": [],
            "Medium": [],
            "Low": [],
            "No Priority": []
        };

        return tickets.reduce((acc, ticket) => {
            let key;

            if (grouping === "user") {
                const user = users.find((u) => u.id === ticket.userId);
                key = user ? user.name : "Unknown User";
            } else if (grouping === "priority") {
                key = priorities[ticket.priority] || "Uncategorized";
            } else if (grouping === "status") {
                key = ticket.status || "Uncategorized";
            } else {
                key = ticket[grouping] || "Uncategorized";
            }

            // Ensure fixed grouping logic for status and priority
            if (grouping === "status") {
                key = key in fixedStatuses ? key : "Uncategorized";
            } else if (grouping === "priority") {
                key = key in fixedPriorities ? key : "Uncategorized";
            }

            if (!acc[key]) acc[key] = [];
            acc[key].push(ticket);
            return acc;
        },
            grouping === "status"
                ? { ...fixedStatuses }
                : grouping === "priority"
                    ? { ...fixedPriorities }
                    : {});
    };


    const sortedTickets = [...tickets].sort((a, b) => {
        if (sortBy === "priority") return b.priority - a.priority;
        if (sortBy === "title") return a.title.localeCompare(b.title);
        return 0;
    });

    const groupedTickets = groupTickets(sortedTickets);

    const getUserProfilePic = (userId) => {
        const user = users.find((u) => u.id === userId);
        return user ? `https://via.placeholder.com/30?text=${user.name[0]}` : "";
    };
    const getIcon = (name) => `/icons_FEtask/${name}.svg`;

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const getStatusIcon = (status) => {

        const statusIcons = {
            "todo": "/icons_FEtask/To-do.svg",
            "backlog": "/icons_FEtask/Backlog.svg",
            "in progress": "/icons_FEtask/in-progress.svg",
            "done": "/icons_FEtask/Done.svg",
            "display": "/icons_FEtask/Display.svg",
            "canceled": "/icons_FEtask/Cancelled.svg",
        };
        return statusIcons[status.toLowerCase().trim()] || "/icons_FEtask/default-status.svg";
    };

    const getPriorityIcon = (priority) => {
        const priorityIcons = {
            "No Priority": "./icons_FEtask/No-priority.svg",
            "Low": "./icons_FEtask/Img - Low Priority.svg",
            "Medium": "./icons_FEtask/Img - Medium Priority.svg",
            "High": "./icons_FEtask/Img - High Priority.svg",
            "Urgent": "./icons_FEtask/SVG - Urgent Priority colour.svg",
        };
        return priorityIcons[priority] || "./icons_FEtask/${priority}.svg";
    };
    const getUserFromUserId = (id) => {
        const user = users.find((u) => u.id === id);
        return user;
    }
    const mapPriorityToValue = {
        1: "Low",
        2: "Medium",
        3: "High",
        4: "Urgent",
        0: "No Priority"
    }
    return (
        <div>
            <div className="controls">
                <div className="display-filter">
                    <div className="dropdown-container">
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="display-button">
                            <img src={getIcon("Display")} alt="Display" />  Display  <img src={getIcon("down")} alt="Down" /></button>
                        <div className="dropdown-menu">
                            <div className="group">
                                <p>Grouping</p>
                                <select value={grouping} onChange={(e) => setGrouping(e.target.value)}>
                                    <option value="status">Status</option>
                                    <option value="user">User</option>
                                    <option value="priority">Priority</option>
                                </select>
                            </div>
                            <div className="order">
                                <p>Ordering</p>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="priority">Priority</option>
                                    <option value="title">Title</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="kanban-board">
                {Object.keys(groupedTickets).map((key) => (
                    <div className="column" key={key}>
                        <div className="col">
                            <div className="Status">
                                {grouping === "status" && (
                                    <img src={getStatusIcon(key)} alt="status" className="Stat" />
                                )}
                                {grouping === "priority" && (
                                    <img src={getPriorityIcon(key)} alt="priority" className="Stat" />
                                )}
                                {grouping === "user" && (
                                    <div style={{ position: "relative" }}>
                                        <img src={getUserProfilePic(groupedTickets[key][0].userId)} alt="user" className="profile-pic" />
                                        <div className={`ava-dot ${getUserFromUserId(groupedTickets[key][0].userId).available ? "available" : "unavailable"}`} />
                                    </div>
                                )}
                                <h3>
                                    {key}
                                    <span className="row-count">({groupedTickets[key].length})</span>
                                </h3>
                            </div>
                            <div>
                                <img src={getIcon("add")} alt="Add" className="colAdd" />
                                <img src={getIcon("3 dot menu")} alt="3dot" className="col3dot" />
                            </div>
                        </div>

                        {groupedTickets[key].map((ticket) => (
                            <div className="ticket-card" key={ticket.id}>
                                <div className="ticket-header">
                                    <span>{ticket.id}</span>
                                    {grouping !== "user" && <div style={{ position: "relative" }}>
                                        <img src={getUserProfilePic(groupedTickets[key][0].userId)} alt="user" className="profile-pic" />
                                        <div className={`ava-dot ${getUserFromUserId(groupedTickets[key][0].userId).available ? "available" : "unavailable"}`} />
                                    </div>}
                                </div>
                                <h3 className="Tickettitle">{grouping !== "status" && (
                                    <img src={getStatusIcon(ticket.status)}
                                        alt={ticket.status}
                                        className="Stat"
                                    />)}
                                    {ticket.title}</h3>
                                <div className="footer">
                                    <span className="tag">
                                        {grouping !== "priority" &&
                                            <img src={getPriorityIcon(mapPriorityToValue[ticket.priority])} alt={ticket.priority} className="priorityIcon" />}
                                        <div className="tag-circle" />
                                        {ticket.tag.join(", ")}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

        </div>
    );
}

export default KanbanBoard;
