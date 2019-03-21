import { userResolver } from "./user.resolver";
import { messageResolver } from "./message.resolver";
import { interfacesResolvers } from "./interfaces.resolver";

export default [userResolver, messageResolver, interfacesResolvers] as any;
