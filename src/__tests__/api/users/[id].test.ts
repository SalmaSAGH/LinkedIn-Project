import { GET } from '@/app/api/users/[id]/route';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';



jest.mock('next-auth', () => ({
    getServerSession: jest.fn(),
}));

jest.mock('@/lib/prisma', () => {
    const prismaMock = {
        user: {
            findUnique: jest.fn(),
        },
        friendship: {
            findFirst: jest.fn(),
        },
    };
    return {
        __esModule: true,
        default: prismaMock,
    };
});

const prismaMock = jest.requireMock('@/lib/prisma').default;

describe('GET /api/users/[id]', () => {
    it('renvoie les informations d’un utilisateur et isFriend', async () => {
        const userId = 'user-123';

        // Mock de la session utilisateur connectée
        (getServerSession as jest.Mock).mockResolvedValue({
            user: { id: 'user-456' }, // utilisateur connecté
        });

        // Mock de l'utilisateur recherché
        prismaMock.user.findUnique.mockResolvedValue({
            id: userId,
            name: 'Test User',
            email: 'test@example.com',
            bio: 'Bio',
            skills: ['Node', 'React'],
            image: 'photo.jpg',
            experiences: [],
            educations: [],
        });

        // Mock de la relation d’amitié
        prismaMock.friendship.findFirst.mockResolvedValue({
            id: 'friendship-1',
        });

        // Simulation de requête Next.js avec une URL dynamique
        const url = `http://localhost:3000/api/users/${userId}`;
        const request = new NextRequest(url);

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

        prismaMock.user.findUnique.mockResolvedValue(null);

        const request = new NextRequest('http://localhost:3000/api/users/user-inconnu');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Utilisateur non trouvé');
    });

    it("renvoie 400 si l'id est manquant", async () => {
        const request = new NextRequest('http://localhost:3000/api/users/');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('ID utilisateur manquant');
    });
});
