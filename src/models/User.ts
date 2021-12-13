import { getModelForClass, prop } from "@typegoose/typegoose";

class User {
    @prop({ required: true, unique: true })
    public discordId!: string;

    @prop({ required: true, default: 0 })
    public timesInsulted!: number;
}

export default getModelForClass(User);