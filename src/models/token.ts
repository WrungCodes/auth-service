import mongoose from 'mongoose';
import { Generate } from '../services/generate';

interface TokenAttrs {
    user: string;
    type: string;
}

interface TokenModel extends mongoose.Model<TokenDoc> {
    build(attrs: TokenAttrs): TokenDoc;
}

// An interface that describes the properties
// that a User Document has
interface TokenDoc extends mongoose.Document {
    user: string;
    type: string;
    token: string;
    used: Boolean;
    createdAt: Date;
}

const tokenSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        token: {
            type: String,
            unique: true,
            index: true,
        },
        used: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
      toJSON: {
        transform(doc, ret) {
              ret.id = ret._id;
              delete ret._id;
              delete ret.__v;
        }
      }
    }
);

tokenSchema.pre('save', async function(done) {
    if (this.isNew) {
        this.set('token',  Generate.numbers(8));
    }
    done();
});

tokenSchema.statics.build = (attrs: TokenAttrs) => {
    return new Token(attrs);
};
  
const Token = mongoose.model<TokenDoc, TokenModel>('Token', tokenSchema);
  
export { Token };