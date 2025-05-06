import { log } from "console"
import { GameDocument } from "../models/Game"
import { Mission } from "../models/Mission"
import { User } from "../models/User"

export function mongoGameToApiFormat(g: GameDocument, uuid: string) {
    return {
        ...g.toObject(),
        players: (g.players as unknown as User[]).map(p => {
            return {
                username: p.username,
                wins: g.missions.filter(m => m.assignedTo._id.toString() === p._id.toString() && m.status == "success").length
            }
        }),
        missions: g.missions.filter(m => m.assignedTo as unknown as string == uuid).map((m) => {
            const mission = m.mission as unknown as Mission
            return { _id: m.mission._id, status: m.status, type: mission.type, name: mission.name }
        }),
        winners: (g.winners as unknown as User[]).map((w) => {
            return w.username
        }),
        owner:undefined,
        isAdmin: (g.owner?.toString() === uuid)
    }
}