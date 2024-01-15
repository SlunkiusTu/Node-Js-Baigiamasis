import User from "../models/user.js";
import ticketModel from "../models/ticket.js";

const ADD_TICKET = async (req, res) => {
  try {
    const {
      title,
      ticket_price,
      from_location,
      to_location,
      to_location_photo_url,
    } = req.body;

    const newTicket = new ticketModel({
      title,
      ticket_price,
      from_location,
      to_location,
      to_location_photo_url,
    });

    const savedTicket = await newTicket.save();

    return res
      .status(201)
      .json({ message: "Ticket added successfully", ticket: savedTicket });
  } catch (error) {
    console.error("Error adding ticket:", error);
    return res.status(500).json({ message: "Error adding ticket" });
  }
};

const BUY_TICKET = async (req, res) => {
  const { user_id, ticket_id } = req.body;

  try {
    const user = await User.findById(user_id);
    const ticket = await ticketModel.findById(ticket_id);

    if (!user || !ticket) {
      return res.status(404).json({ message: "User or ticket not found" });
    }

    if (user.money_balance < ticket.ticket_price) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    user.bought_tickets.push(ticket_id);

    user.money_balance -= ticket.ticket_price;

    await user.save();

    return res.status(200).json({ message: "Ticket purchased successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error purchasing ticket" });
  }
};

export { ADD_TICKET, BUY_TICKET };
