import mongoose, { InferSchemaType, Schema } from 'mongoose';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

const FloorPlanJobSchema = new Schema(
	{
		userId: { type: String, required: true, index: true },
		userName: { type: String, required: true },
		userAvatarUrl: { type: String },
		title: { type: String, required: true, default: 'Untitled Project' },
		status: {
			type: String,
			enum: ['pending', 'processing', 'completed', 'failed'],
			default: 'pending',
			required: true,
			index: true,
		},
		source2dUrl: { type: String, required: true },
		source2dPublicId: { type: String, required: true },
		generated3dUrl: { type: String },
		generated3dPublicId: { type: String },
		structure: { type: Schema.Types.Mixed },
		errorMessage: { type: String },
		completedAt: { type: Date },
	},
	{ timestamps: true },
);

FloorPlanJobSchema.index({ userId: 1, createdAt: -1 });

export type FloorPlanJob = InferSchemaType<typeof FloorPlanJobSchema> & { _id: mongoose.Types.ObjectId };

export const FloorPlanJobModel = mongoose.model('FloorPlanJob', FloorPlanJobSchema);
