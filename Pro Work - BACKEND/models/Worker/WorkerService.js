import mongoose from 'mongoose';

const WorkerServiceSchema = new mongoose.Schema({
  Category: {
    type: String,
    required: true,
  },

  Services: [
    {
      ServiceName: {
        type: String,
        required: true,
      },
      SubServices: [
        {
          Service: {
            type: String,
            required: true,
          },
          Details: [
            {
              Detail: {
                type: String,
                required: true,
              },
              Charge: {
                type: Number,
                required: true,
              },
              OverCharge: {
                type: Number,
              }
            }
          ]
        }
      ]
    }
  ],

  isService: {
    type: Boolean,
    default: false,
  },

  UserObjectID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  WorkerObjectID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
  }
});

const WorkerService = mongoose.model("WorkerService", WorkerServiceSchema);

export default WorkerService;
