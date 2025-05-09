import { GameDocument } from "../models/Game"
import { Mission } from "../models/Mission"
import { User } from "../models/User"

export function mongoGameToApiFormat(g: GameDocument, uuid: string) {
    const DEMO_MODE = process.env.DEMO_MODE
    const demoMode = DEMO_MODE?.toLowerCase() === "true" || DEMO_MODE?.toLowerCase() === "1" || DEMO_MODE?.toLowerCase() === "y" || DEMO_MODE?.toLowerCase() === "yes" || Number(DEMO_MODE) === 1
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
            const reviwer = m.reviwedBy as unknown as User

            return { 
                _id: m.mission._id, 
                status: m.status, 
                type: mission.type, 
                name: demoMode ? demo(mission.name) : mission.name,
                reviewer: reviwer ? reviwer.username : undefined
             }
        }),
        winners: (g.winners as unknown as User[]).map((w) => {
            return w.username
        }),
        owner: undefined,
        isAdmin: (g.owner?.toString() === uuid)
    }
}

function demo(texto: string): string {
    const caracteres = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
    let resultado = '';
    for (let i = 0; i < texto.length; i++) {
        const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
        resultado += caracteres[indiceAleatorio];
    }
    return resultado;
}