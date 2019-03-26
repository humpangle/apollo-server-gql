import { userResolver } from "./user.resolver";
import { messageResolver } from "./message.resolver";
import { interfacesResolvers } from "./interfaces.resolver";

// tslint:disable-next-line: no-any
export default [userResolver, messageResolver, interfacesResolvers] as any;
