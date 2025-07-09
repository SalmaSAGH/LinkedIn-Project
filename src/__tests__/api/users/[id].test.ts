import { GET } from '@/app/api/users/[id]/route';
import { getServerSession } from 'next-auth';

jest.mock('next-auth', () => ({
    getServerSession: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
    user: {
        findUnique: jest.fn(),
    },
    friendship: {
        findFirst: jest.fn(),
    },
}));

import prisma from '@/lib/prisma';
import {NextRequest} from "next/server";

describe('GET /api/users/[id]', () => {
    it('renvoie les informations d’un utilisateur et isFriend', async () => {
        const userId = 'user-123';

        (getServerSession as jest.Mock).mockResolvedValue({
            user: { id: 'user-456' },
        });

        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            id: userId,
            name: 'Test User',
            email: 'test@example.com',
            bio: 'Bio',
            skills: ['Node', 'React'],
            image: 'photo.jpg',
            experiences: [],
            educations: [],
        });

        (prisma.friendship.findFirst as jest.Mock).mockResolvedValue({
            id: 'friendship-1',
        });

        const url = `http://localhost:3000/api/users/${userId}`;
        const request = { nextUrl: new URL(url) } as unknown as NextRequest;

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.name).toBe('Test User');
        expect(data.isFriend).toBe(true);
    });

    it("renvoie 404 si l'utilisateur n'existe pas", async () => {
        (getServerSession as jest.Mock).mockResolvedValue({
            user: { id: 'user-456' },
        });

        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

        const url = `http://localhost:3000/api/users/user-inconnu`;
        const request = { nextUrl: new URL(url) } as unknown as NextRequest;

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Utilisateur non trouvé');
    });

    it("renvoie 400 si l'id est manquant", async () => {
        const url = `http://localhost:3000/api/users/`;
        const request = { nextUrl: new URL(url) } as unknown as NextRequest;

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('ID utilisateur manquant');
    });
});
