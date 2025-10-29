// controllers/Contact.js
import Contact from '../models/Contact/Contact.js';
import JWT from 'jsonwebtoken';

const JWT_Secret = process.env.JWT_SECRET || 'replace_with_real_secret_if_missing';

// Helper to decode JWT and return UserObjectID or throw
function verifyTokenAndGetUser(req) {
  const jwtPresent = req.cookies?.UserToken;
  if (!jwtPresent) throw { status: 401, message: 'Please login to send a message.' };
  try {
    const decoded = JWT.verify(jwtPresent, JWT_Secret);
    return decoded.UserObjectID;
  } catch (err) {
    throw { status: 401, message: 'Invalid token' };
  }
}

// POST /contact  -> save message (max 2 per 24h)
export async function contactPost(req, res) {
  try {
    const currUserID = verifyTokenAndGetUser(req);

    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).send({ message: 'Name, email and message are required.' });
    }

    // Count messages in last 24 hours (use UserObjectID field)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await Contact.countDocuments({ UserObjectID: currUserID, createdAt: { $gte: since } });

    if (recentCount >= 2) {
      // compute when they can send next: find the older of the last 2 messages and add 24h
      const recent = await Contact.find({ UserObjectID: currUserID }).sort({ createdAt: -1 }).limit(2);
      const oldest = recent[recent.length - 1];
      let availableAt = null;
      if (oldest?.createdAt) {
        availableAt = new Date(oldest.createdAt.getTime() + 24 * 60 * 60 * 1000);
      }
      return res.status(429).send({
        message: 'Message limit reached. You can resend after 24 hours.',
        availableAt: availableAt ? availableAt.toISOString() : null,
      });
    }

    const contact = new Contact({
      UserObjectID: currUserID,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      message: String(message).trim(),
    });

    const saved = await contact.save();
    return res.status(201).send(saved);

  } catch (err) {
    if (err && err.status) return res.status(err.status).send({ message: err.message });
    console.error('Error saving contact message:', err);
    return res.status(500).send({ message: 'Error saving contact message', error: err.message || err });
  }
}

// GET /contact  -> list (admin/authorized)
export async function contactGet(req, res) {
  try {
    // require login for listing (you can later add role check for admin)
    verifyTokenAndGetUser(req);

    const items = await Contact.find().sort({ createdAt: -1 });
    if (!items || items.length === 0) return res.status(204).send();
    return res.status(200).send(items);
  } catch (err) {
    if (err && err.status) return res.status(err.status).send({ message: err.message });
    console.error('Error fetching contact messages:', err);
    return res.status(500).send({ message: 'Error fetching contact messages', error: err.message || err });
  }
}

// GET /contact/usage -> how many messages user sent in last 24h and when next allowed
export async function contactUsage(req, res) {
  try {
    const currUserID = verifyTokenAndGetUser(req);

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await Contact.countDocuments({ UserObjectID: currUserID, createdAt: { $gte: since } });

    let nextAllowed = null;
    if (recentCount >= 2) {
      const recent = await Contact.find({ UserObjectID: currUserID }).sort({ createdAt: -1 }).limit(2);
      const oldest = recent[recent.length - 1];
      if (oldest?.createdAt) {
        nextAllowed = new Date(oldest.createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString();
      }
    }

    return res.status(200).send({ countLast24h: recentCount, nextAllowed });
  } catch (err) {
    if (err && err.status) return res.status(err.status).send({ message: err.message });
    console.error('Error fetching contact usage:', err);
    return res.status(500).send({ message: 'Error fetching contact usage', error: err.message || err });
  }
}

export async function contactUnreadCount(req, res) {
  try {
    // require auth (reuse your verify helper)
    const currUserID = verifyTokenAndGetUser(req);

    // count unread messages
    const count = await Contact.countDocuments({ read: false });
    return res.status(200).send({ unreadCount: count });
  } catch (err) {
    if (err && err.status) return res.status(err.status).send({ message: err.message });
    console.error('Error fetching unread count:', err);
    return res.status(500).send({ message: 'Error fetching unread count', error: err.message || err });
  }
}

export async function contactMarkRead(req, res) {
  try {
    // require auth
    const currUserID = verifyTokenAndGetUser(req);

    const { id } = req.params;
    if (!id) return res.status(400).send({ message: 'Message id required' });

    const updated = await Contact.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!updated) return res.status(404).send({ message: 'Message not found' });

    return res.status(200).send(updated);
  } catch (err) {
    if (err && err.status) return res.status(err.status).send({ message: err.message });
    console.error('Error marking contact read:', err);
    return res.status(500).send({ message: 'Error marking contact read', error: err.message || err });
  }
}

