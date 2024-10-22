import React from "react";

function Ticket({ ticket }) {
  const { title, priority, user, status } = ticket;
  const priorities = ["No Priority", "Low", "Medium", "High", "Urgent"];
  const statuses=["Todo", "In progress", "Backlog", "Done", "canceled" ];
  return (
    <div className="ticket">
      <h3>{title}</h3>
      <p>User: {user}</p>
      <p>Status: {statuses[status]}</p>
      <p>Priority: {priorities[priority]}</p>
    </div>
  );
}

export default Ticket;
