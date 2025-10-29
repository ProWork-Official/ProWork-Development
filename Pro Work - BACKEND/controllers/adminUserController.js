// controllers/adminUserController.js
import mongoose from 'mongoose';
import User from '../models/User/User.js'
import UserPersonal from '../models/User/UserPersonal.js'
import UserAddress from '../models/User/UserAddress.js'
import UserBooking from '../models/User/UserBooking.js'

/**
 * GET /ayush-admin/users
 * returns all users with personal, address, bookings
 */
export async function adminGetAllUsers(req, res) {
  try {
    // Aggregation lookup to join related collections
    const users = await User.aggregate([
      { $sort: { UserSignUpTime: -1 } },
      {
        $lookup: {
          from: 'userpersonals',          // Mongo collection name (lowercase + s)
          localField: '_id',
          foreignField: 'UserObjectID',
          as: 'personal'
        }
      },
      {
        $lookup: {
          from: 'useraddresses',
          localField: '_id',
          foreignField: 'UserObjectID',
          as: 'addresses'
        }
      },
      {
        $lookup: {
          from: 'userbookings',
          localField: '_id',
          foreignField: 'UserObjectID',
          as: 'bookings'
        }
      }
    ]);

    return res.status(200).json(users);
  } catch (err) {
    console.error('adminGetAllUsers error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

/**
 * GET /ayush-admin/users/:id
 */
export async function adminGetUserById(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });

    const user = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'userpersonals',
          localField: '_id',
          foreignField: 'UserObjectID',
          as: 'personal'
        }
      },
      {
        $lookup: {
          from: 'useraddresses',
          localField: '_id',
          foreignField: 'UserObjectID',
          as: 'addresses'
        }
      },
      {
        $lookup: {
          from: 'userbookings',
          localField: '_id',
          foreignField: 'UserObjectID',
          as: 'bookings'
        }
      }
    ]);

    if (!user || user.length === 0) return res.status(404).json({ message: 'Not found' });
    return res.status(200).json(user[0]);
  } catch (err) {
    console.error('adminGetUserById error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

/**
 * PUT /ayush-admin/users/:id
 * Accepts a body that may contain:
 * - user: { PhoneNumber, ... } to update base User
 * - personal: { Name, Email, isPersonal }
 * - address: { Address, Landmark, PinCode } -- this will upsert address doc
 */
export async function adminUpdateUser(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });

    const { user, personal, address } = req.body;
    const updates = {};

    if (user) {
      // update base user
      await User.findByIdAndUpdate(id, user, { new: true });
    }
    if (personal) {
      // upsert personal
      await UserPersonal.findOneAndUpdate(
        { UserObjectID: id },
        { ...personal, UserObjectID: id, isPersonal: true },
        { upsert: true, new: true }
      );
    }
    if (address) {
      // upsert address (creates a new address entry or updates existing first address)
      await UserAddress.findOneAndUpdate(
        { UserObjectID: id },
        { ...address, UserObjectID: id, isAddress: true },
        { upsert: true, new: true }
      );
    }

    // return updated aggregated doc
    const updated = await adminGetUserByIdHelper(id);
    return res.status(200).json(updated);
  } catch (err) {
    console.error('adminUpdateUser error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

/**
 * helper to reuse aggregation
 */
async function adminGetUserByIdHelper(id) {
  const mongooseId = new mongoose.Types.ObjectId(id);
  const arr = await User.aggregate([
    { $match: { _id: mongooseId } },
    {
      $lookup: {
        from: 'userpersonals',
        localField: '_id',
        foreignField: 'UserObjectID',
        as: 'personal'
      }
    },
    {
      $lookup: {
        from: 'useraddresses',
        localField: '_id',
        foreignField: 'UserObjectID',
        as: 'addresses'
      }
    },
    {
      $lookup: {
        from: 'userbookings',
        localField: '_id',
        foreignField: 'UserObjectID',
        as: 'bookings'
      }
    }
  ]);
  return arr[0];
}

/**
 * DELETE /ayush-admin/users/:id
 * Deletes user and related personal, addresses, bookings documents
 */
export async function adminDeleteUser(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });

    await User.findByIdAndDelete(id);
    await UserPersonal.deleteMany({ UserObjectID: id });
    await UserAddress.deleteMany({ UserObjectID: id });
    await UserBooking.deleteMany({ UserObjectID: id });

    return res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    console.error('adminDeleteUser error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}
